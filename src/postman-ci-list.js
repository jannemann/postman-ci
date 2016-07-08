#!/usr/bin/env node
'use strict';

var Request = require('request');

var apiKey = process.env.apiKey;
var host = 'api.getpostman.com';

var options = {
  baseUrl: 'https://' + host,
  headers: {
    'X-Api-Key': apiKey
  },
  timeout: 1500
};

function getObjectIDs(type) {
  return new Promise(function (fulfill, reject) {
    Request('/' + type +'s', options, function (error, response, body) {
      var IDs = [];
      if (!error && response.statusCode === 200) {
        JSON.parse(body)[type + 's'].forEach(function (entry) {
            IDs.push(entry.uid);
        });
        fulfill(IDs);
      } else {
        reject(error);
      }
    });
  });
}
function getObject(id, type) {
  return new Promise(function (fulfill, reject) {
    //console.log('get ' +  type + ' with ID: ' + id);
    Request('/' + type +'s/' + id, options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var object = JSON.parse(body)[type];
        //console.log('got ' +  type + ' with ID');
        //console.log(object);
        if(type === "collection") {
          object.info['uid'] = id;
        }
        fulfill(object);
      } else {
        console.log(error);
        reject(error);
      }
    });
  });
}

function getObjects(ids, type) {
  return new Promise(function (fulfill) {
    var promises = [];
    var objects = [];

    ids.forEach(function (entry) {
      promises.push(getObject(entry, type));
    });

    Promise.all(promises).then(function (results) {
      results.forEach(function (result) {
        objects.push(result);
      });
      fulfill(objects);
    });
  });
}

function getList(type) {
  return new Promise(function (fulfill) {
    getObjectIDs(type).then(function (ids) {
      //console.log(type + ' IDs:');
      //wconsole.log(ids);
      return getObjects(ids, type).then(function (result) {
        fulfill(result);
      });
    });
  });
}

function main() {
  Promise.all([getList('environment'), getList('collection')])
    .then(function (results) {
      var environments = results[0];
      var collections = results[1];

      console.log('environments: ' + environments.length);
      environments.forEach(function (result){
        console.log(result.id + "|" + result.name);
      });

      console.log('collections: ' + collections.length);
      collections.forEach(function (result){
        console.log(result.info.uid + '|' + result.info.name);
      });

    })
    .catch(function (error) {
      console.log('error: ' + error);
    });
}

main();
