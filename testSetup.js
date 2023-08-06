const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async function() {
  // Starten Sie den Docker-Container
  await exec('docker-compose up -d');
  // Geben Sie der Datenbank etwas Zeit, um vollständig hochzufahren
  await new Promise(resolve => setTimeout(resolve, 5000));
};
