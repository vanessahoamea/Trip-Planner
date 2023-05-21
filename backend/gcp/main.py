import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import datastore
from google.cloud.datastore.query import PropertyFilter
from functions import get_email, get_videos_youtube, get_abusive_report
from dotenv import dotenv_values

app = Flask(__name__)
CORS(app)

env = dotenv_values()

@app.route("/")
def index():
    return "Welcome to the API!"

@app.route("/events", methods=["POST"])
def add_event():
    body = request.json
    bearer_token = request.headers["Authorization"].split("Bearer ")[1]
    email = get_email(bearer_token)

    if not body or ("name" not in body or "start_date" not in body or "end_date" not in body):
        return {"message": "Fields 'name', 'start_date', 'end_date' are required."}, 400
    if not bearer_token or not email:
        return {"message": "Bearer token is required"}, 401

    ds = datastore.Client()

    entity = datastore.Entity(key=ds.key("events"))
    entity.update({
        "email": email,
        **body
    })
    ds.put(entity)

    return {"message": "Created event."}, 201


@app.route("/events", methods=["GET"])
def get_events():
    bearer_token = request.headers["Authorization"].split("Bearer ")[1]
    email = get_email(bearer_token)

    if not bearer_token or not email:
        return {"message": "Bearer token is required"}, 401

    ds = datastore.Client()

    query = ds.query(kind="events")
    query = query.add_filter(filter=PropertyFilter("email", "=", email))

    result = []
    for row in query.fetch():
        result.append(row)

    return {"data": result}, 200


@app.route("/youtubeVideos", methods=["GET"])
def get_videos():
    searchParameter = request.args.get("name", type = str)
    result = []
    result = get_videos_youtube(searchParameter)
    
    return {"data": result}, 200

@app.route("/claims", methods=["GET"])
def get_claims():
    searchParameter = request.args.get("name", type = str)

    params = {
        "languageCode": "en",
        "query": searchParameter,
        "key": env["API_KEY"]
    }
    response = requests.get(f"https://factchecktools.googleapis.com/v1alpha1/claims:search?", params)
    
    if "claims" in response.json():
        return {"data": response.json()["claims"]}, 200
    return {"data": []}, 200

@app.route("/abusiveReport", methods=["GET"])
def get_abusive_api():
    searchParameter = request.args.get("name", type = str)
    status_Api, result_api = get_abusive_report(searchParameter)   
    if status_Api == 0:
        return {"message": "Site was not found!"}, 404
    else:
        return {"data": result_api}, 200

@app.route("/timeZone", methods=["GET"])
def get_time_zone():
    lat = request.args.get("lat", type = str)
    lon = request.args.get("lon", type = str)
    timestamp = int(time.time())

    if not lat or not lon:
        return {"message": "Fields 'lat', 'lon' are required."}, 400

    params = {
        "location": lat + "," + lon,
        "timestamp": timestamp,
        "key": env["API_KEY"]
    }
    response = requests.get(f"https://maps.googleapis.com/maps/api/timezone/json?", params)
    response = response.json()

    return response, 200
    
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8081, debug=True)