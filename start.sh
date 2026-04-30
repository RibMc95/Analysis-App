#!/bin/sh
set -e

# Start Flask API in the background
cd /app/api
/opt/venv/bin/python main.py &

# Keep container alive with nginx in foreground
exec nginx -g 'daemon off;'
