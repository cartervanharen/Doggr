import requests
import random

get_uuids_url = "http://localhost:3000/get-all-uuid"
post_interaction_url = "http://localhost:3000/manual-add-interaction"

def fetch_uuids():
    response = requests.get(get_uuids_url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Failed to fetch UUIDs")

def post_interaction(user_from, user_to, relation_number):
    interaction_data = {
        "userFrom": user_from,
        "userTo": user_to,
        "relationNumber": relation_number
    }
    response = requests.post(post_interaction_url, json=interaction_data)
    if response.status_code != 200:
        raise Exception("Failed to post interaction: " + response.text)

def main():
    try:
        uuids = fetch_uuids()
        mid_point = len(uuids) // 2 
        uuids = uuids[mid_point:] 

        # uuids.reverse()
        uuid_list = [item['uuid'] for item in uuids]
        existing_interactions = set()

        for user_from in uuid_list:
            potential_users = [u for u in uuid_list if u != user_from]
            random.shuffle(potential_users)
            interactions_count = 0

            for user_to in potential_users:
                if interactions_count >= 3:  
                    break
                if (user_from, user_to) not in existing_interactions:
                    relation_number = 1
                    post_interaction(user_from, user_to, relation_number)
                    print(f"Posted interaction from {user_from} to {user_to} with type {relation_number}")
                    existing_interactions.add((user_from, user_to))
                    interactions_count += 1

    except Exception as e:
        print(str(e))

if __name__ == "__main__":
    main()
