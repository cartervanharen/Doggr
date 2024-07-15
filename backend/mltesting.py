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

model_path = "backend/multi_trait_model.h5"
scaler_path = "backend/scaler.pkl"
model = load_model(model_path)
scaler = joblib.load(scaler_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    user_traits = data.get("user_traits", [])
    
    if not user_traits or len(user_traits) != 6:
        return jsonify({"error": "Invalid input data"}), 400
    
    try:
        desirable_traits = predict_user_traits(model, scaler, user_traits)
        return jsonify({"predicted_traits": desirable_traits})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=3000)
