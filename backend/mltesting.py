import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import tensorflow as tf

def load_model():
    return tf.keras.models.load_model('backend/trained_model.h5')

def recommend_users(model, user_data, user_id, num_recommendations=20):
    potential_matches = user_data[user_data['user_id'] != user_id]

    user_features = user_data[user_data['user_id'] == user_id].drop('user_id', axis=1)

    if user_features.empty:
        raise ValueError("User ID not found in the dataset.")

    input_features = np.repeat(user_features.values, len(potential_matches), axis=0)

    match_features = potential_matches.drop('user_id', axis=1).values
    features_combined = np.concatenate((input_features, match_features), axis=1)

    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features_combined) 

    probabilities = model.predict(features_scaled)
    top_indices = np.argsort(-probabilities.flatten())[:num_recommendations]

    return potential_matches.iloc[top_indices]['user_id'].values

def main():
    user_data = pd.read_csv('backend/user_data.csv')
    model = load_model()
    user_id = int(input("Enter user ID for recommendations: "))
    recommended_user_ids = recommend_users(model, user_data, user_id)
    print("Recommended User IDs:", recommended_user_ids)

if __name__ == '__main__':
    main()
