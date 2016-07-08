# postman-ci

node.js cli tool to integrate postman and newman with your favorite CI

## Setup

npm install -g postman-ci

## Run (in bash)

export apikey="00000000000000000000000000000000"

postman-ci list

export collectionID="00000-00000000-0000-0000-0000-000000000000"

export environmentID="00000000-0000-0000-0000-000000000000"

postman-ci test -c $collectionID -e $environmentID

## Credits

- Postman Cloud API: <https://api.getpostman.com/>
- Postman cli collection runner and library: <https://github.com/postmanlabs/newman>
- node.js: <https://github.com/nodejs/node>
- request: <https://github.com/request/request>
- commander: <https://github.com/tj/commander.js>
