// store the global data store used by other functions
let store = null;

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

// called when data is updated
let refresh_data = () => {
    console.log('hello')
}

get_data();
