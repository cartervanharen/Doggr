import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import tensorflow as tf

def load_data():
    user_data = pd.read_csv('backend/user_data.csv')
    interaction_data = pd.read_csv('backend/interactions.csv')
    interactions = interaction_data.merge(user_data.add_suffix('_1'), left_on='user1', right_on='user_id_1')
    interactions = interactions.merge(user_data.add_suffix('_2'), left_on='user2', right_on='user_id_2')
    interactions['interaction'] = interactions['interaction'].apply(lambda x: 1 if x == 'like' else 0)
    return interactions.drop(['user1', 'user2', 'user_id_1', 'user_id_2'], axis=1), interactions['interaction'], user_data

def load_model():
    return tf.keras.models.load_model('backend/trained_model.h5')

def recommend_users(model, user_data, user_id, num_recommendations=20):
    potential_matches = user_data[user_data['user_id'] != user_id]
    user_features = user_data[user_data['user_id'] == user_id].iloc[0]
    
    combined = potential_matches.copy()
    for col in user_data.columns:
        combined[col + '_user1'] = user_features[col]

    combined = combined.drop(['user_id'], axis=1)

    scaler = StandardScaler()
    combined_scaled = scaler.fit_transform(combined)

    probabilities = model.predict(combined_scaled)[:, 0] 
    top_indices = np.argsort(-probabilities)[:num_recommendations] 
    
    return potential_matches.iloc[top_indices]['user_id']

def main():
    user_id = int(input("Enter user ID for recommendations: "))
    X, y, user_data = load_data()

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = load_model()
    loss, accuracy = model.evaluate(X_scaled, y)
    print(f"Model evaluation - Loss: {loss}, Accuracy: {accuracy}")

    top_matches = recommend_users(model, user_data, user_id, 20)
    print(f"Top 20 recommended users for user {user_id}: {top_matches.tolist()}")

if __name__ == '__main__':
    main()
