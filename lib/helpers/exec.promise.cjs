const { exec } = require('child_process')
/**
 *
 * @param {String} comando
 * @returns {Promise<{stdout: String, stderr: String}|ExecException>}
 */
function execPromise (comando) {
  return new Promise((resolve, reject) => {
    exec(comando, (err, stdout, stderr) => {
      if (err) { return reject(err) }
      resolve({ stdout, stderr })
    })
  })
}

module.exports = { execPromise }
