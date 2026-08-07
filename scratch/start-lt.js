const localtunnel = require('localtunnel');
const fs = require('fs');
(async () => {
  const tunnel = await localtunnel({ port: 3000 });
  fs.writeFileSync('lt-url.txt', tunnel.url);
  console.log('Tunnel started at:', tunnel.url);
})();
