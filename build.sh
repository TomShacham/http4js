#!/usr/bin/env bash

find . -type f -name "*.js" | grep -v node_modules | grep src | xargs rm && \
find . -type f -name "*.d.ts" | grep -v node_modules | grep src | xargs rm && \
find . -type f -name "*.js" | grep -v node_modules | grep test | xargs rm && \
find . -type f -name "*.d.ts" | grep -v node_modules | grep test | xargs rm && \
yarn run tsc -b http4js-core/tsconfig.json && \
yarn run tsc -b http4js-clients/tsconfig.json && \
yarn run tsc -b http4js-zipkin/tsconfig.json && \
yarn run tsc -b http4js-express-server/tsconfig.json && \
yarn run tsc -b http4js-koa-server/tsconfig.json