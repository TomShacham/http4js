#!/usr/bin/env bash
set -x

./clean.sh && \
yarn build && \
yarn test && \
rm -rf dist && \
cp -r src/main dist && \
cp package.json tsconfig.json dist && \
pushd dist && \
npm publish && \
popd && \
rm -r dist && \
./clean.sh
