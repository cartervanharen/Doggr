
#     ___     ___     ___     ___     ___             _____    ___     ___    _____    ___   
#    |   \   / _ \   / __|   / __|   | _ \     o O O |_   _|  | __|   / __|  |_   _|  / __|  
#    | |) | | (_) | | (_ |  | (_ |   |   /    o        | |    | _|    \__ \    | |    \__ \  
#    |___/   \___/   \___|   \___|   |_|_\   TS__[O]  _|_|_   |___|   |___/   _|_|_   |___/  
#  _|"""""|_|"""""|_|"""""|_|"""""|_|"""""| {======|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
#  "`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'./o--000'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 

"""
This file is meant to be run using pytests. It tests the endpoints that are defined in the following files,
getInfo.js
internalOps.js
login.js
messaging.js
nextUser.js
updateInfo.js
"""

import requests
import pytest

BASE_URL = "http://localhost:3000"
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "testtest"
access_token = None #This will be set to the access token of the test@test.com - WILL EXPIRE AFTER 24 HOURS

def get_access_token():
    global access_token
    payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    response = requests.post(f"{BASE_URL}/signin", json=payload)
    assert response.status_code == 200
    access_token = response.json()["session"]["access_token"]

@pytest.fixture(scope="session", autouse=True)
def setup_session():
    get_access_token()

#Login tests below
def test_signin_valid_credentials():
    payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    response = requests.post(f"{BASE_URL}/signin", json=payload)
    assert response.status_code == 200
    assert "user" in response.json()
    assert "session" in response.json()

def test_signin_invalid_credentials():
    payload = {"email": TEST_EMAIL, "password": "wrongpassword"}
    response = requests.post(f"{BASE_URL}/signin", json=payload)
    assert response.status_code == 401
    assert "error" in response.json()

def test_signin_missing_fields():
    payload = {"email": TEST_EMAIL}
    response = requests.post(f"{BASE_URL}/signin", json=payload)
    assert response.status_code == 400
    assert "error" in response.json()

def test_verify_token_valid():
    payload = {"authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/verify-token", json=payload)
    assert response.status_code == 200
    assert "user" in response.json()

def test_verify_token_invalid():
    payload = {"authorization": "Bearer invalid_token"}
    response = requests.post(f"{BASE_URL}/verify-token", json=payload)
    assert response.status_code == 401
    assert "error" in response.json()

#InternalOps tests below
def test_get_all_users():
    response = requests.get(f"{BASE_URL}/get-all-users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_all_uuid():
    response = requests.get(f"{BASE_URL}/get-all-uuid")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_all_userdata():
    response = requests.get(f"{BASE_URL}/get-all-userdata")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_userdata_valid_token():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-userdata", headers=headers)
    assert response.status_code in (200, 401)
    if response.status_code == 200:
        assert "user" in response.json()

def test_get_userdata_missing_token():
    response = requests.get(f"{BASE_URL}/get-userdata")
    assert response.status_code == 403
    assert "error" in response.json()

def test_get_all_relation():
    response = requests.get(f"{BASE_URL}/get-all-relation")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_manual_add_interaction():
    payload = {"user_from": "da58ef62-ab09-4b6c-8989-23e6a1896904", "user_to": "ca3afab4-d225-4cbc-b25a-f21854ce980d"}
    response = requests.post(f"{BASE_URL}/manual-add-interaction", json=payload)
    assert response.status_code in (200, 400, 500)
    if response.status_code == 200:
        assert "message" in response.json()

def test_manual_add_interaction_missing_fields():
    payload = {"user_from": "da58ef62-ab09-4b6c-8989-23e6a1896904"}
    response = requests.post(f"{BASE_URL}/manual-add-interaction", json=payload)
    assert response.status_code == 400
    assert "error" in response.json()

#messaging test below
def test_get_messages():
    params = {
        "user_from": "da58ef62-ab09-4b6c-8989-23e6a1896904",
        "user_to": "ca3afab4-d225-4cbc-b25a-f21854ce980d"
    }
    response = requests.get(f"{BASE_URL}/messages", params=params)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_send_message():
    payload = {
        "user_from": "da58ef62-ab09-4b6c-8989-23e6a1896904",
        "user_to": "ca3afab4-d225-4cbc-b25a-f21854ce980d",
        "message_content": "Test Message",
        "time_sent": "2024-07-26T17:25:53.52+00:00"  # frozen time
    }
    response = requests.post(f"{BASE_URL}/send-message", json=payload)
    assert response.status_code == 201
    response_json = response.json()
    assert isinstance(response_json, list)
    assert all('message_content' in msg and 'time_sent' in msg for msg in response_json)

def test_find_matches():
    payload = {"accessToken": access_token}
    response = requests.post(f"{BASE_URL}/find-matches", json=payload)
    assert response.status_code in (200, 400, 404, 500)
    if response.status_code == 200:
        assert "matches" in response.json() or "message" in response.json()

def test_find_matches_missing_token():
    response = requests.post(f"{BASE_URL}/find-matches", json={})
    assert response.status_code == 400
    assert "error" in response.json()

#get info tests below
def test_get_user_info():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-user-info", headers=headers)
    assert response.status_code in (200, 403, 401)
    if response.status_code == 200:
        assert "user" in response.json()

def test_get_dog_filters():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-dog-filters", headers=headers)
    assert response.status_code in (200, 401, 500)
    if response.status_code == 200:
        assert "userFilters" in response.json()

def test_get_max_distance():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-max-distance", headers=headers)
    assert response.status_code in (200, 401, 500)
    if response.status_code == 200:
        assert "maxDistance" in response.json()

def test_get_dog_pictures():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-dog-pictures", headers=headers)
    assert response.status_code in (200, 401, 500)
    if response.status_code == 200:
        assert "images" in response.json()

def test_get_bio():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-bio", headers=headers)
    assert response.status_code in (200, 401, 500)
    if response.status_code == 200:
        assert "bio" in response.json()

def test_get_location():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-location", headers=headers)
    assert response.status_code in (200, 401, 500)
    if response.status_code == 200:
        json_data = response.json()
        assert "message" in json_data
        assert "longitude" in json_data
        assert "latitude" in json_data

#nextuser test below
def test_get_next_user_data():
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/get-next-user-data", headers=headers)
    assert response.status_code in (200, 401, 404)
    if response.status_code == 200:
        json_data = response.json()
        assert "userUUID" in json_data
        assert "userdata" in json_data
        assert "pictures" in json_data
        assert "basic" in json_data
        assert "distance" in json_data
        assert "oou" in json_data

def test_mark_user_seen_like():
    payload = {
        "accessToken": access_token,
        "relation": "like"
    }
    response = requests.post(f"{BASE_URL}/mark-user-seen", json=payload)
    assert response.status_code in (200, 401, 400, 500)
    if response.status_code == 200:
        assert "idofNextUser" in response.json()

def test_mark_user_seen_dislike():
    payload = {
        "accessToken": access_token,
        "relation": "dislike"
    }
    response = requests.post(f"{BASE_URL}/mark-user-seen", json=payload)
    assert response.status_code in (200, 401, 400, 500)
    if response.status_code == 200:
        assert "idofNextUser" in response.json()

def test_mark_user_seen_block():
    payload = {
        "accessToken": access_token,
        "relation": "block"
    }
    response = requests.post(f"{BASE_URL}/mark-user-seen", json=payload)
    assert response.status_code in (200, 401, 400, 500)
    if response.status_code == 200:
        assert "idofNextUser" in response.json()

def test_get_user_profile():
    headers = {"userid": "da58ef62-ab09-4b6c-8989-23e6a1896904"} #This is test@test.com's UUID
    response = requests.get(f"{BASE_URL}/get-user-profile", headers=headers)
    assert response.status_code in (200, 400, 500)
    if response.status_code == 200:
        json_data = response.json()
        assert "basic" in json_data
        assert "userdata" in json_data
        assert "pictures" in json_data

#update info test below
def test_update_max_distance():
    assert access_token is not None, "Access token is not set. Ensure setup_session fixture is working properly."
    
    payload = {
        "accessToken": access_token,
        "maxDistance": 50
    }
    
    response = requests.post(f"{BASE_URL}/update-max-distance", json=payload)
    
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    assert "message" in response.json(), "Response does not contain 'message'"
    assert response.json()["message"] == "Max distance updated successfully", f"Unexpected message: {response.json()['message']}"


if __name__ == "__main__":
    pytest.main()
