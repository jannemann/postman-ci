'use strict';
var packageVersion = require('../package.json').version;


function globals() {
  this.printHelp = function () {
    console.log('  postman-ci is a tool to integrate postman cloud api and newman into your CI');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    export apiKey=00000000000000000000000000000000');
    console.log('    postman-ci list');
    console.log('    postman-ci test -c POSTMAN_COLLECTION_UID -e POSTMAN_ENVIRONMENT_ID');
    console.log('');
  }

  this.version = packageVersion;
}


module.exports = globals;
