const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async function () {
  await exec("docker-compose up -d");
  // // Geben Sie der Datenbank etwas Zeit, um vollständig hochzufahren
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log("test mysql docker instance up");
};
