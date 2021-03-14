#!/bin/bash
set -e

docker build --ssh default -t infoproc_cw .

docker run -it --init -p 8080:8080 infoproc_cw:latest
