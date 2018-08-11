#!/usr/bin/env bash
set -x

yarn build && \
yarn test-all && \
rm -rf dist && \
cp -r src/main dist && \
cp package.json tsconfig.json README.md dist && \
pushd dist && \
npm publish && \
popd && \
rm -r dist && \
./clean.sh &&
echo "* add release notes *"
