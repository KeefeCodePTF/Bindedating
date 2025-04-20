const https = require('https');

function reverseGeocode(lat, lng, callback) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        callback(null, json.address?.city || json.display_name || "Unknown");
      } catch (err) {
        callback(err, null);
      }
    });
  }).on('error', (err) => callback(err, null));
}

module.exports = { reverseGeocode };