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




