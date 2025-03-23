#!/bin/bash

# Download prebuilt FFmpeg binary
#!/bin/bash

# Create directory for binaries
mkdir -p ffmpeg

# Download and extract FFmpeg
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar -xJ --strip-components=1 -C ffmpeg

# Download yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ffmpeg/yt-dlp

# Make yt-dlp executable
chmod +x ffmpeg/yt-dlp

# Set PATH to include the ffmpeg directory (which now has both ffmpeg and yt-dlp)
export PATH=$PWD/ffmpeg:$PATH

# Verify installations
echo "FFmpeg version:"
ffmpeg -version
echo "yt-dlp version:"
yt-dlp --version

# Start the application
node app.js