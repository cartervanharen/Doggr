import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import json
import requests


url = "http://localhost:3000/signup-complete"

data = {
    "accessToken": "eyJhbGciOiJIUzI1NiIsImtpZCI6IkJ1SzVKWlRYSFBXWVJ0eDAiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzIwNjU5Mjk1LCJpYXQiOjE3MjA2NDEyOTUsImlzcyI6Imh0dHBzOi8vb2V3ZWxnYm5uemd5YW1ocHh5cXMuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6ImY3NGU3ZGE0LTkwY2QtNGIyNS05ZTI0LTdjMGI4YjY3YzQ4YSIsImVtYWlsIjoiMUB0ZXN0LmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiIxQHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6ImY3NGU3ZGE0LTkwY2QtNGIyNS05ZTI0LTdjMGI4YjY3YzQ4YSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzIwNjQxMjk1fV0sInNlc3Npb25faWQiOiJmNGVmZmQ3OC0yZDc0LTQ5MTgtODZmZC01YmYzMWQ5ODllMjgiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.mKTenLdAQsoQNeWt-OzgyBBaAOV6Gop17KKk_oZspmA",
    "email": "5@email.com",
    "password": "5@email.co",
    "human_first_name": "John",
    "human_last_name": "Doe",
    "address": "123 Main St, Anytown, USA",
    "dog_name": "Rex",
    "picture1": "https://example.com/picture1.jpg",
    "picture2": "https://example.com/picture2.jpg",
    "picture3": "https://example.com/picture3.jpg",
    "picture4": "https://example.com/picture4.jpg",
    "picture5": "https://example.com/picture5.jpg",
    "bio": "BIOBIOBIOBIO",
    "likeability": 8,
    "energy": 7,
    "playfulness": 9,
    "aggression": 3,
    "size": 4,
    "training": 4
}

headers = {
    'Content-Type': 'application/json'
}

response = requests.post(url, data=json.dumps(data), headers=headers)

print(response.status_code)
print(response.json())

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)

        if parsed_path.path == '/action' and 'name' in query_params:
            name = query_params['name'][0] 
            message = f"Hello, {name}!"
        else:
            message = "Hello, World!"

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(message.encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])  
        post_data = self.rfile.read(content_length)  

        try:
            data = json.loads(post_data.decode('utf-8')) 
            if 'name' in data:
                message = f"Hello, {data['name']}! Your data was received."
            else:
                message = "Error: 'name' key not found in JSON data."
        except json.JSONDecodeError:
            message = "Error: Invalid JSON data."


        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {"message": message}
        self.wfile.write(json.dumps(response).encode('utf-8'))

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving at port", PORT)
    httpd.serve_forever()