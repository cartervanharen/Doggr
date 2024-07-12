import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
import os

def generate_user_data(num_users=6000):
    user_data = pd.DataFrame({
        'user_id': range(num_users),
        'likeability': np.random.randint(1, 10, num_users),
        'energy': np.random.randint(1, 10, num_users),
        'playfulness': np.random.randint(1, 10, num_users),
        'aggression': np.random.randint(1, 10, num_users),
        'size': np.random.randint(1, 10, num_users),
        'training': np.random.randint(1, 10, num_users),
    })
    user_data.to_csv('backend/user_data.csv', index=False) 
    return user_data

def generate_interactions(user_data, num_interactions=8000):
    interactions = []
    users = user_data['user_id'].tolist()
    for _ in range(num_interactions):
        user1 = np.random.choice(users)
        user2 = np.random.choice([u for u in users if u != user1])
        interaction_type = np.random.choice(['like', 'dislike'])
        interactions.append([user1, user2, interaction_type])
    interaction_df = pd.DataFrame(interactions, columns=['user1', 'user2', 'interaction'])
    interaction_df.to_csv('backend/interactions.csv', index=False)
    return interaction_df

def prepare_interaction_data(user_data, interaction_data):
    df = interaction_data.merge(user_data.add_suffix('_user1'), left_on='user1', right_on='user_id_user1')
    df = df.merge(user_data.add_suffix('_user2'), left_on='user2', right_on='user_id_user2')
    df.drop(['user_id_user1', 'user_id_user2', 'user1', 'user2'], axis=1, inplace=True)
    df['interaction'] = df['interaction'].apply(lambda x: 1 if x == 'like' else 0)
    return df

def build_model(input_shape):
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(input_shape,)),
        tf.keras.layers.LeakyReLU(alpha=0.01),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def main():
    user_data = generate_user_data()
    interactions = generate_interactions(user_data)
    interaction_data = prepare_interaction_data(user_data, interactions)

    X = interaction_data.drop('interaction', axis=1)
    y = interaction_data['interaction']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    model = build_model(X_train.shape[1])

    model.fit(X_train, y_train, epochs=300, validation_split=0.2)

    model.save('backend/trained_model.h5')

if __name__ == '__main__':
    main()
