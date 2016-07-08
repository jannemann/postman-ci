#!/usr/bin/env node

'use strict';
var Request = require('request');
var Newman = require('newman');
var Fs = require('fs');
var program = require('commander');

var globals = require('./globals');
var globalsInstances = new globals();

var apiKey = process.env.POSTMAN_API_KEY;
var host = 'api.getpostman.com';

var tempDir = './temp';
var resultsDir = './results';

if (!Fs.existsSync(tempDir)) {
  Fs.mkdirSync(tempDir);
}
if (!Fs.existsSync(resultsDir)) {
  Fs.mkdirSync(resultsDir);
}

var options = {
  baseUrl: 'https://' + host,
  headers: {
    'X-Api-Key': apiKey
  },
  timeout: 3000
};

function getObject(id, type) {
  return new Promise(function (fulfill, reject) {
    Request('/' + type + 's/' + id, options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var object = JSON.parse(body)[type];
        fulfill(object);
      } else {
        console.log(error);
        console.log('Failed to download ' + type + ' with (U)ID: ' + id);
        reject(error);
      }
    });
  });
}

function test(collection, environment) {
  var newmanOptions = {
    //folder: //Specify a single folder to run from a collection
    envJson: environment, // environment file (in parsed json format)
    //global: //Specify a Postman globals file as JSON
    //dataFile: data.csv, //Specify a data file to use either json or csv
    //exportEnvironment //Specify an output file to dump the Postman environment before exiting
    //exportGlobals  //Specify an output file to dump Globals before exiting
    delay: 500, //Specify a delay (in ms) between requests
    requestTimeout: 15000, //Specify a request timeout (in ms) for a request (Defaults to 15000 if not set)
    iterationCount: 1, // define the number of times the runner should run
    testReportFile: resultsDir + '/' + collection.info.name + '_test.xml', // the file to export to
    responseHandler: "TestResponseHandler", // the response handler to use
    insecure: false, //Disable strict ssl
    asLibrary: true, // this makes sure the exit code is returned as an argument to the callback function
    stopOnError: false, //Stops the runner when a test case fails
    exitCode: true, //Continue running tests even after a failure, but exit with code=1
    //noSummary: true, //Does not show the summary for each iteration
    //noColor: false, //Disable colored output
    //noTestSymbols: false, //Disable symbols in test output and use PASS|FAIL instead
    //pretty: true, //(Use with -i) Enable pretty-print while saving imported collections, environments, and globals
    //outputFileVerbose: tempDir + '/' + 'newman.log'
  }

  // Optional Callback function which will be executed once Newman is done executing all its tasks.
  Newman.execute(collection, newmanOptions, newman_finished_callback);
}

function newman_finished_callback(exitCode) {
  console.log('Newman finished with code ' + exitCode);
  process.exit(exitCode);
}

function main() {
  program
    .option('-c, --collection [uid]', 'Specify a Postman collection UID')
    .option('-e, --environment [id]', 'Specify a Postman environment ID')
    .on('--help', function () {
      globalsInstances.printHelp();
    })
    .parse(process.argv);

  if (!program.environment || !program.collection) {
    program.help();
  } else {
    Promise.all([getObject(program.environment, 'environment'), getObject(program.collection, 'collection')])
      .then(function (results) {
        var collection = results[1];
        var environment = results[0];

        console.log('environment name: ' + environment.name);
        console.log('collection name: ' + collection.info.name);

        console.log('start test');
        test(collection, environment);
      })
      .catch(function (error) {
        console.log(error);
        console.log("Failed to fetch testing specs");
        process.exit(1);
      });
  }
}

main();
