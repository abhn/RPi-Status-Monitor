import urllib.request
import json
from flask import Flask, render_template, jsonify
import time
import psutil
import os

app = Flask(__name__)

# signup and get api key from here: https://openweathermap.org/appid
# the api also supports city param
LAT = '19.45'
LON = '73.33'
WEATHER_API_KEY = os.environ['OPENWEATHERAPI']
WEATHER_API = 'http://api.openweathermap.org/data/2.5/weather?lat={}&lon={}&appid={}'.format(LAT, LON, WEATHER_API_KEY)

# set the interface name to monitor
INTERFACE_NAME = 'wlan0'
TX_FILE = '/sys/class/net/{}/statistics/tx_bytes'.format(INTERFACE_NAME)
RX_FILE = '/sys/class/net/{}/statistics/rx_bytes'.format(INTERFACE_NAME)


def get_current_weather():
    """
        Calls the api and returns temperature and city name.
        Interesting data checks out
        TODO: more data can be used to create something visual and interesting here.
    """
    data_raw = urllib.request.urlopen(WEATHER_API).read()
    data = json.loads(data_raw.decode('ascii'))

    # convert from kelvin to celsius
    temperature = int(data['main']['temp']) - 273
    name = data['name']

    return {
            'temperature': temperature,
            'name': name
    }


def get_txrx():
    """
    opens the network stats file for the said interface, record the packet count for each tx and rx
    wait for 250ms and then record again
    difference multiplied by 4 is the bytes transferred per second
    :return:
    """

    with open(RX_FILE) as f:
        RX = int(f.read().rstrip())

    with open(TX_FILE) as f:
        TX = int(f.read().rstrip())

    time.sleep(0.25)

    with open(RX_FILE) as f:
        RX = int(f.read().rstrip()) - RX

    with open(TX_FILE) as f:
        TX = int(f.read().rstrip()) - TX

    # multiply output by 4 because the interval is 1/4th of a second
    return {
        'TX': TX * 4,
        'RX': RX * 4
    }


def get_network_stats():
    """
    get data from helper function and return a formatted dictionary
    :return: { upload: xx, download: yy }
    """
    data = get_txrx()
    
    return {
        'upload': data['TX'],
        'download': data['RX']
    }


def get_system_stats():
    """
    get cpu and ram usage percentages
    :return: { cpu: xx, ram: yy }
    """
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
    """
    this is our 'rest' api, the data cow
    this api is polled continously,
    :return: weather, network and system stats
    """
    current_weather = get_current_weather()
    network = get_network_stats()
    system = get_system_stats()

    return jsonify({'weather': current_weather, 'network': network, 'system': system})


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
