"""
@fileoverview This file contains the implementation of a Flask-based web application for Doggr, integrating a machine learning model to predict user traits based on their interactions. The application provides two primary functionalities:
1. Retraining the neural network model with updated user data and interactions.
2. Predicting traits for a user based on provided input traits using the trained model.
This script includes functions for data fetching, feature creation, model training, and prediction. It also sets up a background scheduler to automate the model retraining process.

@author Carter VanHaren
"""

import os
import numpy as np
import tensorflow as tf
import joblib
from flask import Flask, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import requests
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

"""
Fetch data from a given URL.

@param url: The URL to fetch data from.
@return: JSON data if successful, None otherwise.
"""
def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print("Failed to fetch data:", response.status_code)
        return None

"""
Create feature and target arrays for the machine learning model.

@param user_from: UUID of the 'from' user.
@param user_to: UUID of the 'to' user.
@param users_df: DataFrame containing user data.
@return: Tuple of features and targets if both users exist, (None, None) otherwise.
"""
def create_features_and_targets(user_from, user_to, users_df):
    user_from_traits = users_df[users_df["uuid"] == user_from].squeeze()
    user_to_traits = users_df[users_df["uuid"] == user_to].squeeze()
    if not user_from_traits.empty and not user_to_traits.empty:
        trait_keys = [
            "likeability",
            "energy",
            "playfulness",
            "aggression",
            "size",
            "training",]
        features = [user_from_traits[key] for key in trait_keys if key in user_from_traits]
        targets = [user_to_traits[key] for key in trait_keys if key in user_to_traits]
        return features, targets
    else:
        return None, None    
        
"""
Re-train the neural network model using the latest data.

@return: Dictionary containing metrics such as loss, MAE, and RMSE.
"""
def ML_ReTrain():
    print("ReTraining NN now")
    user_data_url = "http://localhost:3000/get-all-userdata"
    relation_data_url = "http://localhost:3000/get-all-relation"
    user_data = fetch_data(user_data_url)
    relation_data = fetch_data(relation_data_url)
    user_df = pd.DataFrame(user_data)
    relation_df = pd.DataFrame(relation_data)
    samples = [
        create_features_and_targets(row["user_from"], row["user_to"], user_df)
        for index, row in relation_df[relation_df["type"] == 1].iterrows()
    ]
    samples = [
        sample for sample in samples if sample[0] is not None and sample[1] is not None
    ]
    if len(samples) == 0:
        print("No valid samples found.")
        return "No valid samples found."
    else:
        features = [sample[0] for sample in samples]
        targets = [sample[1] for sample in samples]
        features = np.array(features)
        targets = np.array(targets)
        print(f"Features shape: {features.shape}")
        print(f"Targets shape: {targets.shape}")
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        joblib.dump(scaler, scaler_path)
        X_train, X_test, y_train, y_test = train_test_split(features_scaled, targets, test_size=0.2, random_state=42)
        model = tf.keras.models.Sequential([
            tf.keras.layers.Dense(64, activation="relu", input_shape=(X_train.shape[1],)),
            tf.keras.layers.Dense(64, activation="relu"),
            tf.keras.layers.Dense(64, activation="relu"),
            tf.keras.layers.Dense(y_train.shape[1])
        ])
        model.compile(optimizer="adam", loss="mean_squared_error")
        model.fit(X_train, y_train, epochs=20, validation_split=0.2)
        loss = model.evaluate(X_test, y_test)
        print(f"Test loss (MSE): {loss}")

        y_pred = model.predict(X_test)
        mae = np.mean(np.abs(y_test - y_pred))
        rmse = np.sqrt(np.mean(np.square(y_test - y_pred)))
        print(f"Test MAE: {mae}")
        print(f"Test RMSE: {rmse}")

        # Save the model
        model.save(model_path)
        print("Model saved successfully")
        
        # Return metrics
        return {
            "loss": loss,
            "mae": mae,
            "rmse": rmse
        }
        
"""
Load a TensorFlow model from entered path.

@param path: The path to the model file.
@return: The loaded TensorFlow model.
"""
def load_model(path):
    return tf.keras.models.load_model(path, compile=False)


"""
Predict user traits using the trained model and scaler.

@param model: The trained TensorFlow model.
@param scaler: The scaler used to scale the input features.
@param user_traits: List of user traits to predict from.
@return: List of predicted traits.
"""
def predict_user_traits(model, scaler, user_traits):
    user_traits = np.array(user_traits).reshape(1, -1)
    user_traits_scaled = scaler.transform(user_traits)
    predicted_traits = model.predict(user_traits_scaled)
    predicted_traits = np.clip(np.round(predicted_traits.flatten()), 1, 10).astype(int)
    return predicted_traits.tolist()

base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, "multi_trait_model.h5")
scaler_path = os.path.join(base_dir, "scaler.pkl")
model = load_model(model_path)
scaler = joblib.load(scaler_path)

"""
Runs ML_ReTrain at 1 am everday with cron job
"""
def schedule_ML_ReTrain():
    scheduler = BackgroundScheduler()
    scheduler.add_job(ML_ReTrain, 'cron', hour=1) #Re trains the neural network every day at 1 am
    scheduler.start()

@app.route("/retrain", methods=["GET"])
def retrain():
    try:
        metrics = ML_ReTrain()
        return jsonify({"message": "Retraining completed", "metrics": metrics}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

"""
Endpoint to predict traits based on provided user traits.

@return: JSON response with predicted traits or error message.
"""
@app.route("/predict", methods=["GET"])
def predict():
    print("call")
    user_traits = [
        request.args.get("trait1", type=int),
        request.args.get("trait2", type=int),
        request.args.get("trait3", type=int),
        request.args.get("trait4", type=int),
        request.args.get("trait5", type=int),
        request.args.get("trait6", type=int),
    ]
    if (
        not all(isinstance(trait, int) for trait in user_traits)
        or len(user_traits) != 6
    ):
        return jsonify({"error": "Invalid or missing input traits"}), 400
    try:
        desirable_traits = predict_user_traits(model, scaler, user_traits)
        return jsonify({"predicted_traits": desirable_traits})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    schedule_ML_ReTrain()
    app.run(debug=True, port=3001, host="0.0.0.0")
