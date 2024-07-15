import os
import numpy as np
import tensorflow as tf
import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

def load_model(path):
    return tf.keras.models.load_model(path, compile=False)

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

@app.route('/predict', methods=['GET'])  
def predict():
    print("call")
    user_traits = [
        request.args.get('trait1', type=int),
        request.args.get('trait2', type=int),
        request.args.get('trait3', type=int),
        request.args.get('trait4', type=int),
        request.args.get('trait5', type=int),
        request.args.get('trait6', type=int)
    ]
    
    if not all(isinstance(trait, int) for trait in user_traits) or len(user_traits) != 6:
        return jsonify({"error": "Invalid or missing input traits"}), 400

    try:
        desirable_traits = predict_user_traits(model, scaler, user_traits)
        return jsonify({"predicted_traits": desirable_traits})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=3001, host='0.0.0.0')
