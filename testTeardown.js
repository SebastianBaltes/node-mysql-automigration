const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async function() {
  // Stoppen Sie den Docker-Container und entfernen Sie ihn
  await exec('docker-compose down');
};
