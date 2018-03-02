## Http4js

A port of [http4k](https://github.com/http4k/http4k): a lightweight _toolkit_ to allow in memory functional testing and to simplify working with HTTP. 

#### To run: 

`tsc index.ts --target es5; node index.js`

#### To test:

```
npm install --save
npm test
```

**In order to run tests in idea/webstorm**, you may need to:

```
npm install @types/mocha --save-dev
npm install ts-node      --save-dev
npm install typescript   --save-dev 
```

#### To do

- add a type or interface for Filter, instead of referring to it as HttpHandler -> HttpHandler. 
Then you can add the "then" methods to it to recreate the chaining?
- support express backend
- other client verbs, PUT, PATCH, HEAD etc.
- write docs
