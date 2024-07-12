import json
import requests
from faker import Faker
import random
import time
fake = Faker()

url = "http://localhost:3000/signup-complete"

bay_area_cities = [
    'San Francisco', 'San Jose', 'Oakland', 
    'Berkeley', 'Mountain View', 'Palo Alto', 
    'Santa Clara', 'Sunnyvale', 'San Mateo', 
    'Redwood City', 'Fremont', 'Hayward'
]

def grabDogImg():
    dogimg = requests.get('https://dog.ceo/api/breeds/image/random')

    if dogimg.status_code == 200:
        dogimg = dogimg.json()
        print("Random Dog Image URL:", dogimg['message'])
        return dogimg['message']
    else:
        print("Failed to fetch data")
        return "No image available"

print(grabDogImg())





def generate_random_data():
    
    street_address = fake.street_address()

    city = random.choice(bay_area_cities)

    state = 'California'
    postal_code = fake.postcode_in_state(state_abbr='CA')


    full_address = f"{street_address}, {city}, {state} {postal_code}"
    
    name = fake.first_name()+fake.first_name()
    
    email = str(name) + "@test.com"
    print(email)
    return {
        
        "accessToken": fake.sha256(raw_output=False),
        "email": email,
        "password": "testtest",
        "human_first_name": name,
        "human_last_name": fake.last_name(),
        "address": full_address,
        "dog_name": fake.first_name(),
        "picture1": grabDogImg(),
        "picture2": grabDogImg(),
        "picture3": grabDogImg(),
        "picture4": grabDogImg(),
        "picture5": grabDogImg(),
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

for _ in range(3000):
    data = generate_random_data()
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}, Response: {response.json()}")
