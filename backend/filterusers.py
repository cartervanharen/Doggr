# from supabase import create_client, Client


# # Supabase project URL and API key
# url: str = 'https://oewelgbnnzgyamhpxyqs.supabase.co'
# key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2VsZ2JubnpneWFtaHB4eXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzQ0MDIsImV4cCI6MjAzNDkxMDQwMn0.wrKCzM1wbzyTLwBN7xbYu2mzS2GzQ6zAWHNe9Wv1BBo'

# # Create a Supabase client
# supabase: Client = create_client(url, key)

# # Delete rows where longitude or latitude is NULL
# response = supabase.table('userdata').delete().is_('longitude', None).or_('latitude', None).execute()

# # Check the response
# if response.error:
#     print(f"An error occurred: {response.error}")
# else:
#     print("Rows deleted successfully:", response.data)
import json
import requests
# from faker import Faker
# import random

# fake = Faker()

# url = "http://localhost:3000/signup-complete"

# bay_area_cities = [
#     'San Francisco', 'San Jose', 'Oakland', 
#     'Berkeley', 'Mountain View', 'Palo Alto', 
#     'Santa Clara', 'Sunnyvale', 'San Mateo', 
#     'Redwood City', 'Fremont', 'Hayward'
# ]

# street_address = fake.street_address()

# city = random.choice(bay_area_cities)

# state = 'California'
# postal_code = fake.postcode_in_state(state_abbr='CA')


# full_address = f"{street_address}, {city}, {state} {postal_code}"

# print(full_address)

# Fetch a random dog image
def grabDogImg():
    dogimg = requests.get('https://dog.ceo/api/breeds/image/random')

    if dogimg.status_code == 200:
        dogimg = dogimg.json()
        print("Random Dog Image URL:", dogimg['message'])
        return dogimg['message']
    else:
        print("Failed to fetch data")
        return "No image available"

# Call the function to print the result
print(grabDogImg())