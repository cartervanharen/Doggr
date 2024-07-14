import numpy as np
import tensorflow as tf
import joblib


def load_model(path):
    return tf.keras.models.load_model(path, compile=False)


def predict_user_traits(model, scaler, user_traits):

    user_traits = np.array(user_traits).reshape(1, -1)

    user_traits_scaled = scaler.transform(user_traits)

    predicted_traits = model.predict(user_traits_scaled)

    predicted_traits = [round(trait) for trait in predicted_traits.flatten()]
    return predicted_traits

def main():
    model_path = 'backend/multi_trait_model.h5'
    scaler_path = 'backend/scaler.pkl'
    model = load_model(model_path)
    scaler = joblib.load(scaler_path)

    user_traits = [1,10,1,10,1,10,]  
    desirable_traits = predict_user_traits(model, scaler, user_traits)
    print("Predicted Desirable Traits:", desirable_traits)

if __name__ == "__main__":
    main()
