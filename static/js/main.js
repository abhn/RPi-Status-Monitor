// store the global data store used by other functions
let store = null;

// for pretty date printing
let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
 
// repeatedly poll this api for fresh data, mostly network traffic will change
// this is definitely a websocket usecase, TODO maybe?
let get_data = () => {
    fetch('/data')

    .then(res => {
        return res.json()
    })

    .then(data => {
        // store the new data in our data object
        store = data;
        refresh_data();
        get_data();
    })

    .catch(err => {
        console.log(err);
        // if a timeout or any such error occurs, slow down polling to once every 3 seconds
        // I know, horrible design
        window.setTimeout(() => {
            get_data();
        }, 3000);
    })
}

// called every second to refresh center clock
let refresh_time = () => {

	let current_date = new Date();
    let current_hours = current_date.getHours();
    let current_minutes = current_date.getMinutes();
    let current_seconds = current_date.getSeconds();
    
    if (current_hours < 10) current_hours = '0' + current_hours
    if (current_minutes < 10) current_minutes = '0' + current_minutes
    if (current_seconds < 10) current_seconds = '0' + current_seconds
    
    let dom_time_text = document.getElementById('time-text');
    dom_time_text.innerHTML = `${current_hours}:${current_minutes}:${current_seconds}`;
}


let refresh_weather = () => {
	
	let weather = store.weather;
	let name = weather.name;
	let temperature = weather.temperature;
	
	let dom_temperature_text = document.getElementById('temperature-text');
	let dom_weather_city = document.getElementById('weather-city');

	let temperature_text = temperature + '°C';
	let weather_text = name[0].toUpperCase() + name.slice(1);
	
	dom_temperature_text.innerHTML = temperature_text;
	dom_weather_city.innerHTML = weather_text;
}

// this doesn't have to be replaced at every api call, TODO fix this
let refresh_date = () => {
	let current_date = new Date();
	
	let dom_date_string = document.getElementById('date-string');
	let dom_year_string = document.getElementById('year-string');
	
	let day = current_date.getDay();
	let month = current_date.getMonth();
	let date = current_date.getDate();
	let year = current_date.getFullYear();
	
	let day_string = days[day].slice(0, 3);
	let month_string = months[month].slice(0, 3);
	
	let date_string = `${day_string}, ${month_string} ${date}`;
	let year_string = `${year}`;
	
	dom_date_string.innerHTML = date_string;
	dom_year_string.innerHTML = year_string;
}


let refresh_network = () => {
	let network = store.network;
	let download = network.download;
	let upload = network.upload;
	
	let dom_download = document.getElementById('download');
	let dom_upload = document.getElementById('upload');
	
	download = Math.round(download / 1000); // kb conversion
	upload = Math.round(upload / 1000);
	
	// cross them because for the rpi's wlan0 interface, uploading = downloading for the rest of us
	let download_string = `D&darr;: ${upload} kBps`;
	let upload_string = `U&uarr;: ${download} kBps`;
	
	dom_download.innerHTML = download_string;
	dom_upload.innerHTML = upload_string; 
}


let refresh_system = () => {
	let system = store.system;
	let cpu = system.cpu;
	let ram = system.ram;

	let dom_cpu = document.getElementById('cpu');
	let dom_ram = document.getElementById('ram');
	
	let cpu_string = `CPU: ${cpu}%`;
	let ram_string = `RAM: ${ram}%`;
	
	dom_cpu.innerHTML = cpu_string;
	dom_ram.innerHTML = ram_string;
}


let refresh_quote = () => {
    let dom_quote = document.getElementById('quote');

    fetch('/static/quotes.txt')
    .then(res => {
        return res.text()
    })
    .then(data => {
        let quote_list = data.split('\n');
        let randomly_choosen_quote = quote_list[Math.floor(Math.random() * quote_list.length)];
        dom_quote.innerHTML = randomly_choosen_quote;
    })
    .catch(err => {
        console.log(err);
        dom_quote.innerHTML = 'Old is gold.';
    })
}

// driver function gets called after each api call, get_data calls this
let refresh_data = () => {
	refresh_weather();
	refresh_date();
	refresh_network();
	refresh_system();
}

// this is for time keeping, independent of the rest here
window.setInterval(() => {
	refresh_time();
}, 1000);

// set a new quote every 15 minutes
window.setInterval(() => {
    refresh_quote();
}, 900000);

// initial call to start polling data from flask rest endpoint
get_data();

// initial call to put on the quote
refresh_quote();
