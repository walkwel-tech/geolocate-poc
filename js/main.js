if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/geolocation.worker.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
