import urllib.request
import json
from flask import Flask, render_template, jsonify
import time
import psutil
import os

app = Flask(__name__)

# index is going to be needing the following data
# current_weather { temprature
# network_speed { upload, download }
# system_usage { cpu, ram }
WEATHER_API_KEY = os.environ['OPENWEATHERAPI']
WEATHER_API = 'http://api.openweathermap.org/data/2.5/weather?lat=19.45&lon=73.33&appid=' + WEATHER_API_KEY

TX = None
RX = None

def get_current_weather():
    """API response
    {'sys': {'sunrise': 1530145873, 'id': 7761, 'type': 1, 'sunset': 1530193733, 'message': 0.0057, 'country': 'IN'}, 'wind': {'speed': 2.1, 'deg': 160}, 'name': 'Shahapur', 'main': {'temp': 300.15, 'temp_min': 300.15, 'humidity': 94, 'pressure': 1002, 'temp_max': 300.15}, 'clouds': {'all': 75}, 'visibility': 2500, 'cod': 200, 'dt': 1530212400, 'base': 'stations', 'coord': {'lat': 19.45, 'lon': 73.33}, 'id': 1256747, 'weather': [{'description': 'mist', 'id': 701, 'icon': '50n', 'main': 'Mist'}]}
    """
    data_raw = urllib.request.urlopen(WEATHER_API).read()
    data = json.loads(data_raw.decode('ascii'))

    temperature = int(data['main']['temp']) - 273
    name = data['name']
    # icon = data['weather'][0]['icon'] + 'n' + '.png'

    return {
            'temperature': temperature,
            'name': name
    }


def get_txrx():
    with open('/sys/class/net/wlan0/statistics/rx_bytes') as f:
        RX = int(f.read().rstrip())

    with open('/sys/class/net/wlan0/statistics/tx_bytes') as f:
        TX = int(f.read().rstrip())

    time.sleep(0.250)

    with open('/sys/class/net/wlan0/statistics/rx_bytes') as f:
        RX = int(f.read().rstrip()) - RX

    with open('/sys/class/net/wlan0/statistics/tx_bytes') as f:
        TX = int(f.read().rstrip()) - TX

    return {
        'TX': TX,
        'RX': RX
    }

def get_network_stats():
    data = get_txrx()
    
    return {
        'upload': data['TX'],
        'download': data['RX']
    }


def get_system_stats():
    cpu_percent = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent

    return {
        'cpu': cpu_percent,
        'ram': ram
    }


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def data_endpoint():
    current_weather = get_current_weather()
    network = get_network_stats()
    system = get_system_stats()

    return jsonify({'weather': current_weather, 'network': network, 'system': system})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
