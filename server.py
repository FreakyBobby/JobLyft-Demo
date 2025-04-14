from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Set response status code and headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Create a simple response
        response = {
            "message": "Hello, this is a simple HTTP server!",
            "status": "running"
        }
        
        # Send the response
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        # Get the length of the POST data
        content_length = int(self.headers['Content-Length'])
        
        # Read the POST data
        post_data = self.rfile.read(content_length)
        
        # Set response status code and headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Create a response
        response = {
            "message": "Received POST request",
            "data": post_data.decode('utf-8')
        }
        
        # Send the response
        self.wfile.write(json.dumps(response).encode())

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server() 