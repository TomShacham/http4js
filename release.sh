#!/usr/bin/env bash
set -x

read -p "Added release notes? " -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    yarn build && \
    yarn test && \
    rm -rf dist && \
    cp -r src/main dist && \
    cp package.json tsconfig.json README.md dist && \
    pushd dist && \
    npm publish && \
    popd && \
    rm -r dist
fi
