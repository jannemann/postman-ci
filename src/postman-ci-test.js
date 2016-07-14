#!/usr/bin/env node

'use strict';
var Request = require('request');
var Newman = require('newman');
var Fs = require('fs');
var jsonfile = require('jsonfile');
var program = require('commander');

var globals = require('./globals');
var globalsInstances = new globals();

var runtimeNewmanOptions = {};

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
  console.log("get " + id + ", type: " + type);
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

function execute(collection, environment, exportEnvironment) {
  var newmanOptions = {};
  for (var key in runtimeNewmanOptions) {
    newmanOptions[key] = runtimeNewmanOptions[key];
  }
  //newmanOptions.exportGlobalsFile = tempDir + '/' + 'globals.json'; //Specify an output file to dump Globals before exiting
  //global: //Specify a Postman globals file as JSON
  //dataFile: data.csv, //Specify a data file to use either json or csv
  newmanOptions.envJson = environment; // environment file (in parsed json format)
  newmanOptions.testReportFile = resultsDir + '/' + collection.info.name + '_test.xml'; // the file to export to
  if (exportEnvironment) {
    newmanOptions.exportEnvironmentFile = tempDir + '/' + 'loggedInEnvironment.json'; //Specify an output file to dump the Postman environment before exiting
  }

  return new Promise(function (fulfill, reject) {
    Newman.execute(collection, newmanOptions, function (exitCode) {
      console.log('Newman finished with code ' + exitCode);
      if (exitCode === 0) {
        if (exportEnvironment) {
          jsonfile.readFile(tempDir + '/' + 'loggedInEnvironment.json', 'utf-8', function (error, data) {
            if(error) {
              reject(error);
            }
            fulfill(data);
            Fs.unlink(tempDir + '/' + 'loggedInEnvironment.json');
          });
        } else {
          fulfill(environment);
        }
      } else {
        reject(exitCode);
      }
    });
  })
}

function list(val) {
  return val.split(',');
}

function main() {
  program
    .option('-c, --collections <UIDs>', 'Specify a Postman collection UID', list)
    .option('-e, --environment [ID]', 'Specify a Postman environment ID')
    .option('-i, --login [UID]', 'Collection for login, executed first')
    .option('-o, --logout [UID]', 'Collection for logout, executed last')
    .option('--stopOnError', 'stops newman on errors')
    .option('--globalRedirect', 'allows newman on errors')
    .option('--requestTimeout [ms]', 'sets timeout for newman requsts in milliseconds', parseInt)
    .on('--help', function () {
      globalsInstances.printHelp();
    })
    .parse(process.argv);

  for (var key in globalsInstances.newmanOptions) {
    runtimeNewmanOptions[key] = globalsInstances.newmanOptions[key];
  }
  if(program.stopOnError) {
    runtimeNewmanOptions.stopOnError = true;
  }
  if(program.globalRedirect) {
    runtimeNewmanOptions.globalRedirect = true;
  }
  if(program.requestTimeout) {
    runtimeNewmanOptions.requestTimeout = program.requestTimeout;
  }

  if (!program.environment || program.collections.length < 1) {
    program.help();
    process.exit(1);
  }

  var environmentPromise = getObject(program.environment, 'environment');
  if (program.login) {
    var loginPromis = getObject(program.login, 'collection');

    Promise.all([environmentPromise, loginPromis])
      .then(function (results) {
          //environmentPromise = execute(results[1], results[0], true);
          environmentPromise = execute(results[1], results[0]);
          testAllCollections(environmentPromise, program.collections);
      })
      .catch(function (error) {
        console.log(error);
        console.log("Failed to fetch login collection");
        process.exit(1);
      });
  } else {
    testAllCollections(environmentPromise, program.collections);
  }
}

function testAllCollections(environmentPromise, collections) {
  var sequence = Promise.resolve();

  collections.forEach(function (entry) {
    sequence = sequence.then(function(){
      return testCollection(environmentPromise, getObject(entry, 'collection'));
    });
  });
}

function testCollection(environmentPromise, collectionPromise) {
  return new Promise(function (fulfill, reject) {
    Promise.all([environmentPromise, collectionPromise])
      .then(function (results) {
        var collection = results[1];
        var environment = results[0];

        console.log('environment name: ' + environment.name);
        console.log('collection name: ' + collection.info.name);

        console.log('start test');
        execute(collection, environment)
        .then(function () {
          console.log("Testing " + collection.info.name + " done.");
          fulfill(environment);
        });
      })
      .catch(function (error) {
        console.log(error);
        console.log("Failed to fetch testing specs");
        reject(error);
      });
  })
};


main();
