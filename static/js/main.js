// store the global data store used by other functions
let store = null;
let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
 
// repeatedly poll this api for fresh data, mostly network traffic will change
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

// called every second
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
	
	let download_string = `D&darr;: ${download} kBps`;
	let upload_string = `U&uarr;: ${upload} kBps`;
	
	dom_upload.innerHTML = download_string;
	dom_download.innerHTML = upload_string; 
}

let refresh_system = () => {
	let system = store.system;
	let cpu = system.cpu;
	let ram = system.ram;

	let dom_cpu = document.getElementById('cpu');
	let dom_ram = document.getElementById('ram');
	
	let cpu_string = `CPU: ${cpu}% in use`;
	let ram_string = `RAM: ${ram}% in use`;
	
	dom_cpu.innerHTML = cpu_string;
	dom_ram.innerHTML = ram_string;
}

let refresh_data = () => {
	refresh_weather();
	refresh_date();
	refresh_network();
	refresh_system();
}

window.setInterval(() => {
	refresh_time();
}, 1000);

get_data();
