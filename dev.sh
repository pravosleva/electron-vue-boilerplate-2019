#!/bin/bash
fuser -k -n tcp 3000 &
yarn --cwd ./frontend serve
