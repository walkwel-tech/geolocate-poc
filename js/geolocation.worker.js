// Utilizes : https://developers.google.com/maps/documentation/geolocation/overview
// Function to retrieve the user's location from the Geolocation API
const googleGeolocateApi = 'https://www.googleapis.com/geolocation/v1/geolocate';
// Replace with the URL of your API endpoint
const locationCacherUrl = 'https://example.com/api/location';

function getLocation() {
  // Make a request to the Google Geolocation API
  fetch(googleGeolocateApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ considerIp: true }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Send the location data to the API
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'location',
            latitude: data.location.lat,
            longitude: data.location.lng,
          });
        });
      });
    })
    .catch((error) => {
      console.error('Error fetching location:', error);
    });
}

// Function to send location data to the API
function sendLocationToAPI(locationData) {

  fetch(locationCacherUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(locationData),
  })
    .then((response) => {
      if (response.ok) {
        console.log('Location sent successfully');
      } else {
        console.error('Failed to send location');
      }
    })
    .catch((error) => {
      console.error('Error sending location:', error);
    });
}

// Open IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('locationDB', 1);

    request.onerror = () => {
      reject('Error opening database');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('locations', { keyPath: 'timestamp' });
    };
  });
}

// Function to add location data to IndexedDB
function addToIndexedDB(data) {
  openDatabase()
    .then((db) => {
      const transaction = db.transaction('locations', 'readwrite');
      const store = transaction.objectStore('locations');

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('Location data added to IndexedDB');
      };

      request.onerror = (error) => {
        console.error('Error adding location data to IndexedDB:', error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    })
    .catch((error) => {
      console.error('Error opening IndexedDB:', error);
    });
}

// Listen for message event from the main script
self.addEventListener('message', (event) => {
  if (event.data.type === 'location') {
    const { latitude, longitude } = event.data;

    // Send the location data to the API
    sendLocationToAPI({ latitude, longitude });
    addToIndexedDB({ latitude, longitude, timestamp: Date.now() });
  }
});

// Listen for fetch event
self.addEventListener('fetch', (event) => {
  // Intercept the requests to the Google Geolocation API
  if (event.request.url.includes(googleGeolocateApi)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response.json())
        .then((data) => {
          // Send the location data to the API
          sendLocationToAPI(data.location);
          addToIndexedDB({ ...data.location, timestamp: Date.now() });
          return new Response(JSON.stringify(data));
        })
        .catch((error) => {
          console.error('Error fetching location:', error);
          return new Response(null, { status: 500 });
        })
    );
  }
});

// Listen for install event
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Listen for activation event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// // Retrieve the location immediately upon service worker installation
// getLocation();
//
// // Schedule to retrieve the location every 5 seconds
// setInterval(getLocation, 5000);
//
