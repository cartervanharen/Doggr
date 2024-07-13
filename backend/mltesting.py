import numpy as np
import pandas as pd
import requests
from sklearn.preprocessing import StandardScaler
import tensorflow as tf

def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print("Failed to fetch data:", response.status_code)
        return None

def load_model():
    print("Loading model...")
    model = tf.keras.models.load_model('backend/trained_model.h5')
    print("Model loaded.")
    return model

def recommend_users(model, user_data, user_uuid, num_recommendations=20):
    user_data_df = pd.DataFrame(user_data)
    
    if user_uuid not in user_data_df['uuid'].values:
        raise ValueError("User UUID not found in the dataset.")
    
    relevant_features = ['likeability', 'energy', 'playfulness', 'aggression', 'size', 'training']
    user_features = user_data_df.loc[user_data_df['uuid'] == user_uuid, relevant_features]
    
    if user_features.empty:
        raise ValueError("User features not found for the given UUID.")
    
    potential_matches = user_data_df[user_data_df['uuid'] != user_uuid][['uuid'] + relevant_features]
    
    input_features = np.repeat(user_features.values, len(potential_matches), axis=0)
    match_features = potential_matches.drop('uuid', axis=1).values
    features_combined = np.concatenate((input_features, match_features), axis=1)


    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features_combined)

    print(features_scaled)
    probabilities = model.predict(features_scaled)
    top_indices = np.argsort(-probabilities.flatten())[:num_recommendations]
    print(probabilities)
    recommended_uuids = potential_matches.iloc[top_indices]['uuid'].values
    return recommended_uuids

print("Starting...")
user_data = fetch_data("http://localhost:3000/get-all-userdata")

model = load_model()
user_uuid = input("Enter user UUID for recommendations: ")
try:
    recommended_user_uuids = recommend_users(model, user_data, user_uuid)
    print("Recommended User UUIDs:", recommended_user_uuids)
except ValueError as e:
    print(e)
