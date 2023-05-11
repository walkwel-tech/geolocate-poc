if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/geolocation.worker.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

function clearMessage() {
  document.getElementById('message').innerHTML = `${new Date()} |`;
}

// Code to request geolocation api
function initiateLocationAccess() {
  const message = document.getElementById('message');

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log('Got position', position);
    });

    // request user's location using geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          // send user's location to web worker
          const data = {
            type: "location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('new location', data);
          message.append(`${new Date()} | New location: ${data.latitude}, ${data.longitude}`);
          message.append(document.createElement('br'));
        },
        (error) => {
          console.error(`Geolocation error: ${error}`);
          message.append(`${new Date()} | Geolocation error: ${error}`);
          message.append(document.createElement('br'));
        }
      );
    } else {
      console.error("Geolocation not supported.");
      message.append(`${new Date()} | Geolocation not supported.`);
      message.append(document.createElement('br'));
    }
  } else {
    console.error('Geolocation is not supported');
    message.append(`${new Date()} | Geolocation is not supported`);
    message.append(document.createElement('br'));
  }
}
initiateLocationAccess();
