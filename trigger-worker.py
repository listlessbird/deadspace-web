import os
import requests
import time

from dotenv import load_dotenv
load_dotenv(dotenv_path=".env.local")

worker_url = os.environ.get("WORKER_URL")


def trigger_worker():
    response = requests.get(worker_url)
    status = response.status_code
    if status == 200:
        print("Worker triggered successfully")
        json = response.text
        return json
    else:
        print(f"Failed to trigger worker. Status code: {status}")
        return None

if __name__ == "__main__":
    print(worker_url)
    if worker_url is None:
        print("Please set WORKER_URL environment variable")
        exit(1)
    while True:
        worker_response = trigger_worker()
        if worker_response is not None:
            print(worker_response)
        time.sleep(5 * 60)    
                    