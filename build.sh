#!/bin/bash
set -e

yarn esbuild src/index.mjs \
  --bundle \
  --platform=node \
  --format=cjs \
  --target=node20 \
  --outfile=dist/index.cjs \
  --banner:js='#!/usr/bin/env node'

yarn esbuild src/wrapper.mjs \
  --bundle \
  --platform=node \
  --format=cjs \
  --target=node20 \
  --outfile=dist/wrapper.cjs \
  --banner:js='#!/usr/bin/env node'

chmod +x dist/index.cjs
chmod +x dist/wrapper.cjs
