#!/bin/sh
# Substitute PORT environment variable in nginx config
envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf
mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g "daemon off;"
