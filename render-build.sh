#!/bin/bash

# Download prebuilt FFmpeg binary
mkdir -p ffmpeg
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar -xJ --strip-components=1 -C ffmpeg

# Set FFmpeg path
export PATH=$PWD/ffmpeg:$PATH

# Start the application
node app.js