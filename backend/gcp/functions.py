import base64
import json
import googleapiclient.discovery
import googleapiclient.errors
import requests
from dotenv import dotenv_values

env = dotenv_values()

def get_email(jwt):
    payload = jwt.split(".")[1]

    if payload == jwt:
        return None

    base64_data = base64.b64decode(payload)
    user_data = json.loads(base64_data)
    
    return user_data["email"]

def get_videos_youtube(searchParameter):

    api_service_name = "youtube"
    api_version = "v3"

    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey = env["API_KEY"])

    request = youtube.search().list(
        part="snippet",
        q=searchParameter,
        regionCode="UK",
        type="video"
    )
    response = request.execute()
    data = []
    for i in range(len(response['items'])):
        data.append( response['items'][i]['id']['videoId'])
    
    return data 

def get_abusive_report(word_url):
    
    word_url = word_url.replace(":","%3A")
    word_url = word_url.replace("/","%2F")
    get_url = "https://abusiveexperiencereport.googleapis.com/v1/sites/"
    get_url = get_url + word_url
    get_url = get_url + "?key=" + env["API_KEY"]

    status_ok = 1
    response = requests.get(get_url)
    datajson = response.text
    dataAbusiveReport = json.loads(datajson)
    if len(dataAbusiveReport) < 2 :
        status_ok = 0

    return status_ok, dataAbusiveReport