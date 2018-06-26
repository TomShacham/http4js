#!/usr/bin/env bash
set -x

find src -type f -name "*.js" -delete && \
find src -type f -name "*.d.ts" -delete && \
yarn build && \
yarn test && \
rm -rf dist && \
cp -r src/main dist && \
cp package.json tsconfig.json dist && \
pushd dist && \
npm publish && \
popd && \
rm -r dist
