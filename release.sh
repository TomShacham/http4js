#!/usr/bin/env bash
set -x

rm -rf ./dist && tsc -p ./ --outDir dist/
cp package.json ./dist/
