#!/bin/bash
set -e

rm -fr dist/
npm run test
npm run publish
