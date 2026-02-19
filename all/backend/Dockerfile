# CodeOn Runtime Environment
# This container is used to safely execute user code

FROM node:18-alpine

# Install compilers and interpreters
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    g++ \
    make \
    bash \
    curl \
    git \
    openjdk11-jre \
    ruby \
    php \
    go

# Set up workspace
WORKDIR /workspace

# Create non-root user for security
RUN addgroup -S codeon && adduser -S codeon -G codeon
RUN chown -R codeon:codeon /workspace

# Limit processes
RUN echo "codeon:0:1000" > /etc/subuid && \
    echo "codeon:0:1000" > /etc/subgid

# Set resource limits
RUN ulimit -n 1024 && ulimit -u 100

# Use non-root user
USER codeon

# Default command
CMD ["/bin/bash"]
