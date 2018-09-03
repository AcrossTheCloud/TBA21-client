#!/usr/bin/env bash

# cd to directory of this script
cd -P -- "$(dirname -- "$0")"

# remove old config
rm config.js

# symlink correct version
if [ $ENV="dev" ];
then
  ln -s prod-config.js config.js;
else
  ln -s dev-config.js config.js;
fi;
