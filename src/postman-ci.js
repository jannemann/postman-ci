#!/usr/bin/env node

'use strict';

var program = require('commander');
var globals = require('./globals');
var globalsInstances = new globals();

function parseArguments() {
  program
    .version(globalsInstances.version)
    .command('list', 'lists all collection UIDs and environment IDs available').alias('l')
    .command('test', 'tests a given collection with a given environment').alias('t')
    .on('--help', function () {
      globalsInstances.printHelp()
    })
    .parse(process.argv);
}

function main() {
  if (process.env.apiKey) {
    parseArguments();
  } else {
    globalsInstances.printHelp();
    console.log('  Please provide a valid apiKey as environment variable');
  }
}

main();
