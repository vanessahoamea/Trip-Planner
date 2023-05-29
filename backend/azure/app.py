from flask import Flask, request, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, and_
from dotenv import dotenv_values
import requests
import jwt
import os, base64
from azure.core.credentials import AzureKeyCredential
from azure.maps.search import MapsSearchClient


app = Flask(__name__)
cors = CORS(app)

env = dotenv_values()

# database setup
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://{dbuser}:{dbpass}@{dbhost}/{dbname}".format(
    dbuser=env["DBUSER"],
    dbpass=env["DBPASS"],
    dbhost=env["DBHOST"],
    dbname=env["DBNAME"]
)

db = SQLAlchemy(app)

# models
class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(50))
    password = Column(String(250))

class Trip(db.Model):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(50))
    start_date = Column(DateTime)
    end_date = Column(DateTime)

# API endpoints
@app.route("/", methods=["GET"])
def index():
    return {"message": "Welcome to the API!"}

@app.route("/add-user", methods=["POST"])
def add_user():
    body = request.json

    user_exists = User.query.where(User.email == body["email"]).first()
    if user_exists != None:
        return {"message": "This e-mail address is already in use."}, 422
    
    try:
        user = User()
        user.email = body["email"]
        user.password = body["password"]
        db.session.add(user)
        db.session.commit()

        return {"id": user.id, "email": user.email}, 200
    except:
        return {"message": "Fields 'email' and 'password' are required."}, 400

@app.route("/user", methods=["GET"])
def get_user():
    try:
        bearer_token = request.headers["Authorization"].split("Bearer ")[1]
        user_id = jwt.decode(bearer_token, env["SECRET_KEY"], algorithms=["HS256"])
        user_id = user_id["id"]
    except:
        return {"message": "Bearer token is required"}, 401

    user = User.query.where(User.id == user_id).first()
    if user != None:
        return {"id": user.id, "email": user.email}, 200
    else:
        return {"message": "User not found."}, 404

@app.route("/login", methods=["POST"])
def login():
    body = request.json
    try:
        email = body["email"]
        password = body["password"]
        user = User.query.where(and_(User.email == email, User.password == password)).first()

        if user != None:
            token = jwt.encode({"id": user.id}, env["SECRET_KEY"], algorithm="HS256")
            return {"jwt": token}, 200
        else:
            return {"message": "User not found."}, 404
    except:
        return {"message": "Fields 'email' and 'password' are required."}, 400

@app.route("/add-trip", methods=["POST"])
def add_trip():
    body = request.json

    try:
        bearer_token = request.headers["Authorization"].split("Bearer ")[1]
        user_id = jwt.decode(bearer_token, env["SECRET_KEY"], algorithms=["HS256"])
        user_id = user_id["id"]
    except:
        return {"message": "Bearer token is required"}, 401

    try:
        trip = Trip()
        trip.user_id = user_id
        trip.name = body["name"]
        trip.start_date = body["start_date"]
        trip.end_date = body["end_date"]
        db.session.add(trip)
        db.session.commit()

        return {"id": trip.id, "name": trip.name, "start_date": trip.start_date, "end_date": trip.end_date}, 200
    except:
        return {"message": "Fields 'name', 'start_date' and 'end_date' are required."}, 400

@app.route("/trips", methods=["GET"])
def get_user_trips():
    try:
        bearer_token = request.headers["Authorization"].split("Bearer ")[1]
        user_id = jwt.decode(bearer_token, env["SECRET_KEY"], algorithms=["HS256"])
        user_id = user_id["id"]
    except:
        return {"message": "Bearer token is required"}, 401

    trips = Trip.query.where(Trip.user_id == user_id)
    result = [{"name": trip.name, "start_date": trip.start_date, "end_date": trip.end_date} for trip in trips]
    return {"data": result}

@app.route("/news", methods=["GET"])
def get_news():
    search_term = request.args.get("term", default="")
    endpoint = "https://api.bing.microsoft.com/v7.0/news/search"
    headers = {"Ocp-Apim-Subscription-Key" : env["SEARCH_API_KEY"]}
    params  = {"q": search_term, "mkt": "en-US"}

    try:
        response = requests.get(endpoint, headers=headers, params=params)
        search_results = response.json()

        result = []
        for article in search_results["value"]:
            if len(result) >= 15:
                break

            result.append({
                "title": article["name"],
                "url": article["url"],
                "description": article["description"]
            })

        return {"data": result}, 200
    except:
        return {"message": "Could not find any news."}, 500
    
@app.route("/videoSearch",methods = ["GET"])
def get_videoSearch():
    search_term = request.args.get("term", default="")
    endpoint = "https://api.bing.microsoft.com/v7.0/videos/search"
    headers = {"Ocp-Apim-Subscription-Key" : env["SEARCH_API_KEY"]}
    params  = {"q": search_term, "count":5, "pricing": "free"}
    
    try:
        response = requests.get(endpoint, headers=headers, params=params)
        search_results = response.json()

        result = []
        for video in search_results["value"]:
            videoUrlFull = video["contentUrl"]
            videoUrlSplit = videoUrlFull.split("v=")
            videoUrlShort = videoUrlSplit[1]
            result.append(videoUrlShort)

        return {"data": result} , 200
    except:
        return {"message": "Could not find any videos."}, 500

@app.route("/textTranslator", methods=["GET"])
def get_text_translated():
    text_to_be_translated = request.args.get("text", default="hello there you 2")
    key = env["COGNITIVE_TRANSLATOR_API_KEY"]
    endpoint = "https://api.cognitive.microsofttranslator.com/"
    location = "uksouth"
    path = '/translate'
    constructed_url = endpoint + path

    params = {
        'api-version': '3.0',
        'from': request.args.get('from', default='en'),
        'to': [request.args.get('to', default='ro')]
    }

    headers = {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': location,
        'Content-type': 'application/json',
        'X-ClientTraceId': 'b992ee07-52df-4b70-824d-e2ba624635a8'
    }

    body = [{
        'text': text_to_be_translated
    }]

    try:
        response = requests.post(constructed_url, params=params, headers=headers, json=body)
        response = response.json()

        return response[0], 200
    except:
        return {"message": "Could not be translated."}, 500

@app.route("/searchAddress", methods=["GET"])
def search_address():
    location_to_be_searched = request.args.get("location", default="Starbucks, Iasi, Ro")
    key = env["AZURE_MAPS_API_KEY"]
    timezone_endpoint = "https://atlas.microsoft.com/timezone/byCoordinates/json"

    try:
        maps_search_client = MapsSearchClient(credential=AzureKeyCredential(key))

        result = maps_search_client.search_address(query=location_to_be_searched)
        result_geolocation_lon = result.results[0].position.lon
        result_geolocation_lat = result.results[0].position.lat
        result_positions = maps_search_client.fuzzy_search(query=location_to_be_searched, coordinates=(result_geolocation_lat, result_geolocation_lon))
        location_dict = {}
        
        location_params = str(result_geolocation_lat) + ',' + str(result_geolocation_lon)
        params  = {"api-version": "1", "query": location_params, "subscription-key": key}
        
        response_timezone = requests.get(timezone_endpoint, params=params)
        time_zones_dict = {}
        time_zones_dict["location_standard"] = str(response_timezone.json()['TimeZones'][0]['ReferenceTime']['Tag'])
        time_zones_dict["location_time"] = str(response_timezone.json()['TimeZones'][0]['ReferenceTime']['WallTime'])

        for idx, item in enumerate(result_positions.results):
            location_dict[idx]={"address": item.address.freeform_address, "coordinates": {'lat': item.position.lat, 'lon': item.position.lon}}
        
        if len(result_positions.results) > 0:
            return {"locations": {"locations": location_dict, "time_zones": time_zones_dict}}, 200
        else:
            return {"locations": "No address found"}, 200
    except:
        return {"locations": "Location really wrong."}, 500
    
    
@app.route("/textToSpeech", methods=["GET"])
def text_to_speech():
    search_term = request.args.get("phrase", default="This is a text to speech API")
    language_term = request.args.get("language", default="en")
    fetch_token_url = 'https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1'
    headers = {
        'Ocp-Apim-Subscription-Key': env["SPEECH_API_KEY"],
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3'
    }
    text_from_client = search_term
    
    if language_term == "en":
        xml_content = f"""
        <speak version='1.0' xml:lang='en-US'>
        <voice xml:lang='en-US' xml:gender='Male'
        name='en-US-ChristopherNeural'>
        {text_from_client}
        </voice></speak>
        """
    elif language_term == "es":
        xml_content = f"""
        <speak version='1.0' xml:lang='es-ES'>
        <voice xml:lang='es-ES' xml:gender='Female'
        name='es-ES-LiaNeural'>
        {text_from_client}
        </voice></speak>
        """
    elif language_term == "fr":
        xml_content = f"""
        <speak version='1.0' xml:lang='fr-FR'>
        <voice xml:lang='fr-FR' xml:gender='Female'
        name='fr-FR-CelesteNeural'>
        {text_from_client}
        </voice></speak>
        """
    elif language_term == "ro":
        xml_content = f"""
        <speak version='1.0' xml:lang='ro-RO'>
        <voice xml:lang='ro-RO' xml:gender='Male'
        name='ro-RO-EmilNeural'>
        {text_from_client}
        </voice></speak>
        """
    elif language_term == "zh-CN":
        xml_content = f"""
        <speak version='1.0' xml:lang='zh-CN'>
        <voice xml:lang='zh-CN' xml:gender='Male'
        name='zh-CN-YunhaoNeural'>
        {text_from_client}
        </voice></speak>
        """
    elif language_term == "ru":
        xml_content = f"""
        <speak version='1.0' xml:lang='ru-RU'>
        <voice xml:lang='ru-RU' xml:gender='Male'
        name='ru-RU-DmitryNeural'>
        {text_from_client}
        </voice></speak>
        """    
    
        
    try:
        response = requests.post(fetch_token_url, headers=headers, data = xml_content)
        video_body_response = base64.b64encode(response.content)
        if response.headers:
            return video_body_response, 200
        else:
            return {"message": "File cannot be founded!"}, 500
    except:
        return {"message": "Could not convert Text to Speech!"}, 500

    
        
    
if __name__ == "__main__":
    app.run()
