import requests
import pandas as pd
import numpy as np
import random
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
import joblib


def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()  
    else:
        print("Failed to fetch data:", response.status_code)
        return None

def create_features_and_targets(user_from, user_to, users_df):
    user_from_traits = users_df[users_df['uuid'] == user_from].squeeze()
    user_to_traits = users_df[users_df['uuid'] == user_to].squeeze()
    if not user_from_traits.empty and not user_to_traits.empty:
        trait_keys = ['likeability', 'energy', 'playfulness', 'aggression', 'size', 'training']
        features = [user_from_traits[key] for key in trait_keys if key in user_from_traits]
        targets = [user_to_traits[key] for key in trait_keys if key in user_to_traits]
        return features, targets
    else:
        return None, None


user_data_url = "http://localhost:3000/get-all-userdata"
relation_data_url = "http://localhost:3000/get-all-relation"

user_data = fetch_data(user_data_url)
relation_data = fetch_data(relation_data_url)

user_df = pd.DataFrame(user_data)
relation_df = pd.DataFrame(relation_data)

#ignore the dislikes and blocks
samples = [create_features_and_targets(row['user_from'], row['user_to'], user_df) for index, row in relation_df[relation_df['type'] == 1].iterrows()]
samples = [sample for sample in samples if sample[0] is not None and sample[1] is not None]


features = [sample[0] for sample in samples]
targets = [sample[1] for sample in samples]


scaler = StandardScaler()
features_scaled = scaler.fit_transform(features)
joblib.dump(scaler, 'backend/scaler.pkl')


X_train, X_test, y_train, y_test = train_test_split(features_scaled, targets, test_size=0.2, random_state=42)


y_train = np.array(y_train)
y_test = np.array(y_test)

model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(y_train.shape[1])  
])
model.compile(optimizer='adam', loss='mean_squared_error')  


model.fit(X_train, y_train, epochs=20, validation_split=0.2)


model.save('backend/multi_trait_model.h5')
print("Model saved successfully")
