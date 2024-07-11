import json
import requests
from faker import Faker
import random

fake = Faker()

url = "http://localhost:3000/signup-complete"

def generate_random_data():
    return {
        "accessToken": fake.sha256(raw_output=False),
        "email": fake.email(),
        "password": "testtest",
        "human_first_name": fake.first_name(),
        "human_last_name": fake.last_name(),
        "address": fake.address(),
        "dog_name": fake.first_name(),
        "picture1": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0b3D54ORBQwwBaXl5x4We6OfwALBN4_4rUA&s",
        "picture2": "https://www.tronweekly.com/wp-content/uploads/2022/12/Doge-meme-2.webp",
        "picture3": "https://www.dogster.com/wp-content/uploads/2024/03/Shiba-Inu-dog-standing-on-the-road_OlesyaNickolaeva_Shutterstock.jpg",
        "picture4": "https://variety.com/wp-content/uploads/2024/05/Doge-Shiba-Inu-Kabosu.png?w=694",
        "picture5": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHufOy6wIS6tfbMZCpV8cmmDy3FUDeBvzp9w&s",
        "bio": fake.sentence(nb_words=20, variable_nb_words=False),
        "likeability": random.randint(1, 10),
        "energy": random.randint(1, 10),
        "playfulness": random.randint(1, 10),
        "aggression": random.randint(1, 10),
        "size": random.randint(1, 10),
        "training": random.randint(1, 10)
    }

headers = {
    'Content-Type': 'application/json'
}

for _ in range(500):
    data = generate_random_data()
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}, Response: {response.json()}")
