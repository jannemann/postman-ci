'use strict';
var packageVersion = require('../package.json').version;


function globals() {
  this.printHelp = function () {
    console.log('  postman-ci is a tool to integrate postman cloud api and newman into your CI');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    export POSTMAN_API_KEY=00000000000000000000000000000000');
    console.log('    postman-ci list');
    console.log('    postman-ci test -c POSTMAN_COLLECTION_UID -e POSTMAN_ENVIRONMENT_IDs -i POSTMAN_LOGIN_COLLECTION_ID '); //TODO -o POSTMAN_LOGOUT_COLLECTION_ID
    console.log('');
    console.log('    Additional arguments:');
    console.log('        --stopOnError');
    console.log('        --globalRedirect');
    console.log('        --requestTimeout 1500');
    console.log('');
  }

  this.version = packageVersion;

  this.newmanOptions = {
    delay: 500, //Specify a delay (in ms) between requests
    requestTimeout: 15000, //Specify a request timeout (in ms) for a request (Defaults to 15000 if not set)
    iterationCount: 1, // define the number of times the runner should run
    responseHandler: "TestResponseHandler", // the response handler to use
    insecure: false, //Disable strict ssl
    asLibrary: true, // this makes sure the exit code is returned as an argument to the callback function
    stopOnError: false, //Stops the runner when a test case fails
    exitCode: true, //Continue running tests even after a failure, but exit with code=1
    globalRedirect: false
    //noSummary: true, //Does not show the summary for each iteration
    //noColor: false, //Disable colored output
    //noTestSymbols: false, //Disable symbols in test output and use PASS|FAIL instead
    //pretty: true, //(Use with -i) Enable pretty-print while saving imported collections, environments, and globals
    //outputFileVerbose: tempDir + '/' + 'newman.log'
  }
}


module.exports = globals;
