#!/usr/bin/env bash


# cd to directory of this script
cd -P -- "$(dirname -- "$0")"

# Load ENV from the .env file if it exists.
envFile="../.env"
if [ -f $envFile ]
then
    envFileValue=$(cat "$envFile" | grep ENV= | cut -d '=' -f2)
fi
# remove old config
rm config.js


# symlink correct version
if [ "$ENV" = "dev" ] || [ ! -z "$envFileValue" ] && [ $envFileValue = "dev" ]
then
  ln -s dev-config.js config.js
else
  ln -s prod-config.js config.js
fi
