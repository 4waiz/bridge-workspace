#!/bin/bash
# This is a script used by the devcontainer to build the project

# install dependencies
yarn install

# Build Server Dependencies
yarn bridgeflow @bridgeflow/server-native build

# Create database
yarn bridgeflow @bridgeflow/server prisma migrate reset -f
