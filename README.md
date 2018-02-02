## Http4js

A port of http4k: a lightweight _toolkit_ to allow in memory functional testing and to simplify working with HTTP. 

#### To run: 

`tsc; node index.js`

#### To test:

```
npm install --save
npm test
```

**In order to run test in idea/webstorm**, you may need to:

```
npm install @types/mocha --save-dev
npm install ts-node      --save-dev
npm install typescript   --save-dev 
```

#### To do

- client catching errors and supporting all methods
- chaining and nesting filters
- uri has path and host and protocol and scheme and authority
