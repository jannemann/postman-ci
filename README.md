# postman-ci

node.js cli tools to integrate postman and newman with your favorite CI

## Setup

npm install

## Run (in bash)

export apikey="00000000000000000000000000000000"

./listIDs.js

export collectionID="00000-00000000-0000-0000-0000-000000000000"

export environmentID="00000000-0000-0000-0000-000000000000"

./runTestWithIDs.js $collectionID $environmentID

## Credits

- Postman Cloud API: <https://api.getpostman.com/>
- Postman cli collection runner and library: <https://github.com/postmanlabs/newman>
- node.js: <https://github.com/nodejs/node>
- request: <https://github.com/request/request>
