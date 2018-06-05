#!/usr/bin/env bash
set -x

find src -type f -name "*.js" -delete && \
find src -type f -name "*.d.ts" -delete && \
tsc && \
rm -rf dist && \
cp -r src/main dist && \
cp package.json tsconfig.json index.ts index.js dist && \
pushd dist && \
npm publish && \
popd
