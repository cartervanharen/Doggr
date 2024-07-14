import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import json
import numpy as np
import pandas as pd
import requests
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
import time

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

    probabilities = model.predict(features_scaled)
    top_indices = np.argsort(-probabilities.flatten())[:num_recommendations]
    recommended_uuids = potential_matches.iloc[top_indices]['uuid'].values
    return recommended_uuids

model = load_model()

PORT = 8000
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        parsed_path = urlparse(self.path)
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        if parsed_path.path == '/generate-next-users':
            if 'user_uuid' in data:
                user_uuid = data['user_uuid']
                user_data = fetch_data("http://localhost:3000/get-all-userdata")
                try:
           
                    recommended_user_uuids = recommend_users(model, user_data, user_uuid)
                    message = json.dumps({"recommended_user_uuids": recommended_user_uuids.tolist()})
                except ValueError as e:
                    message = json.dumps({"error": str(e)})
            else:
                message = json.dumps({"error": "User UUID not provided."})
        elif 'name' in data:
            name = data['name']
            message = f"Hello, {name}! Your data was received."
        else:
            message = "Error: Expected 'name' key or 'user_uuid' key in JSON data."

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(message.encode('utf-8'))

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving at port", PORT)
    httpd.serve_forever()





# import requests
# import pandas as pd
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import StandardScaler
# import tensorflow as tf
# import time

# def fetch_data(url):
#     try:
#         response = requests.get(url)
#         response.raise_for_status()  # Will raise an HTTPError for bad responses
#         return response.json()
#     except requests.RequestException as e:
#         print(f"Error fetching data: {e}")
#         return None

# import pandas as pd

# def prepare_interaction_data(user_data, interactions):
#     user_df = pd.DataFrame(user_data)
#     interactions_df = pd.DataFrame(interactions)

#     # Keep only relevant columns
#     relevant_user_columns = ['uuid', 'likeability', 'energy', 'playfulness', 'aggression', 'size', 'training']
#     user_df = user_df[relevant_user_columns]

#     # Create a set of available UUIDs
#     available_uuids = set(user_df['uuid'])

#     # Filter interactions to ensure both UUIDs are in the available set
#     interactions_df = interactions_df[
#         interactions_df['user_from'].isin(available_uuids) & 
#         interactions_df['user_to'].isin(available_uuids)
#     ]

#     # Filter interactions of type 1 (users like each other)
#     interactions_df = interactions_df[interactions_df['type'] == 1]

#     # Merging user data for 'user_from' and 'user_to'
#     merged_df = interactions_df.merge(
#         user_df.add_suffix('_from'), left_on='user_from', right_on='uuid_from', how='left'
#     ).merge(
#         user_df.add_suffix('_to'), left_on='user_to', right_on='uuid_to', how='left'
#     )

#     # Define features and labels
#     feature_columns = [f"{col}_from" for col in relevant_user_columns[1:]] + [f"{col}_to" for col in relevant_user_columns[1:]]
#     X = merged_df[feature_columns]
#     y = merged_df['type']

#     return X, y

# # Example usage
# user_data = fetch_data("http://localhost:3000/get-all-userdata")
# interactions = fetch_data("http://localhost:3000/get-all-relation")
# X, y = prepare_interaction_data(user_data, interactions)
# print(X.head())
# print("Data prepared with", X.shape[0], "interactions.")

# def build_model(input_shape):
#     model = tf.keras.Sequential([
#         tf.keras.layers.Dense(64, activation='relu', input_shape=(input_shape,)),
#         tf.keras.layers.Dense(64, activation='relu'),
#         tf.keras.layers.Dense(1, activation='sigmoid')
#     ])
#     model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
#     return model

# def main():
#     url_relations = "http://localhost:3000/get-all-relation"
#     url_users = "http://localhost:3000/get-all-userdata"

#     data_relations = fetch_data(url_relations)
#     data_users = fetch_data(url_users)

#     if data_relations is None or data_users is None:
#         print("Failed to fetch data. Exiting...")
#         return

#     X, y = prepare_interaction_data(data_users, data_relations)
#     if X.empty or y.empty:
#         print("No data available after preparation. Exiting...")
#         return

#     scaler = StandardScaler()
#     X_scaled = scaler.fit_transform(X)

#     X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

#     model = build_model(X_train.shape[1])
#     history = model.fit(X_train, y_train, epochs=300, validation_split=0.2)

#     model.save('trained_model.h5')
#     print("Model trained and saved successfully.")
#     print("Training history:", history.history)  # Debugging line to see training progression

# if __name__ == '__main__':
#     main()
