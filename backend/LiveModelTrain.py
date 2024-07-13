import requests
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
import time

def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

def prepare_interaction_data(user_data, interactions):
    interactions_df = pd.DataFrame(interactions)
    user_data_df = pd.DataFrame(user_data)

    expected_columns = ['uuid', 'likeability', 'energy', 'playfulness', 'aggression', 'size', 'training']
    if not all(col in user_data_df.columns for col in expected_columns):
        raise ValueError("User data must include uuid, likeability, energy, playfulness, aggression, size, training.")

    interactions_df = interactions_df[interactions_df['type'] != 3]
    interactions_df = interactions_df.merge(user_data_df.add_suffix('_from'), left_on='user_from', right_on='uuid_from')
    interactions_df = interactions_df.merge(user_data_df.add_suffix('_to'), left_on='user_to', right_on='uuid_to')

    feature_cols_from = ['likeability_from', 'energy_from', 'playfulness_from', 'aggression_from', 'size_from', 'training_from']
    feature_cols_to = ['likeability_to', 'energy_to', 'playfulness_to', 'aggression_to', 'size_to', 'training_to']

    if not all(col in interactions_df.columns for col in feature_cols_from + feature_cols_to):
        raise KeyError("One or more expected features are missing from the interaction data.")

    interactions_df['type'] = interactions_df['type'].apply(lambda x: 1 if x == 1 else 0)

    return interactions_df[feature_cols_from + feature_cols_to + ['type']]

def build_model(input_shape):
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(input_shape,)),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def main():
    url_relations = "http://localhost:3000/get-all-relation"
    url_users = "http://localhost:3000/get-all-userdata"
    data_relations = fetch_data(url_relations)
    data_users = fetch_data(url_users)
    interaction_data = prepare_interaction_data(data_users, data_relations)
    
    X = interaction_data.drop('type', axis=1)
    y = interaction_data['type']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print(interaction_data.head())  
    time.sleep(10)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    model = build_model(X_train.shape[1])
    model.fit(X_train, y_train, epochs=300, validation_split=0.2)
    model.save('backend/trained_model.h5')

if __name__ == '__main__':
    main()
