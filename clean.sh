#!/usr/bin/env bash
set -x

find src -type f -name "*.js" -delete && \
find src -type f -name "*.d.ts" -delete