import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import json

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