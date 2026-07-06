import urllib.request
import urllib.parse
import json
import sys
import time

API_URL = "http://localhost:8000/api"

def get_token(username="admin@polkaudit.com", password="adminpassword"):
    url = f"{API_URL}/auth/token"
    payload = urllib.parse.urlencode({
        "username": username,
        "password": password
    }).encode()
    req = urllib.request.Request(url, data=payload, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())["access_token"]
    except Exception as e:
        print(f"Auth failed: {e}")
        return None

def verify_async():
    token = get_token()
    if not token:
        return False
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("Triggering Async Sync...")
    start_time = time.time()
    
    # We use ID 1 (Polkadot) or any ID, as the endpoint checks ID inside but returns 202 immediately provided the route is hit
    # Note: Logic inside validates project existence, but async wrapper returns 202 first? 
    # Actually, background_tasks.add_task just schedules it. Validation happens inside the task if not moved.
    # We moved service instantiation inside the task, so the API should return instantly irrelevant of ID validity (unless we add checks before).
    
    req = urllib.request.Request(f"{API_URL}/v1/chains/sync/1", data=b"", headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            duration = time.time() - start_time
            print(f"Response Time: {duration:.4f}s")
            
            if response.status == 202:
                print("SUCCESS: Received 202 Accepted")
                data = json.loads(response.read().decode())
                if data["status"] == "queued":
                     print("SUCCESS: Payload confirms queued status")
                     return True
            else:
                 print(f"FAILED: Unexpected status {response.status}")
                 return False

    except Exception as e:
        print(f"Request Failed: {e}")
        return False

    return True

if __name__ == "__main__":
    if verify_async():
        sys.exit(0)
    else:
        sys.exit(1)
