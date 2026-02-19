FROM node:18-bullseye

# Minimal runtime with node and python
RUN apt-get update && apt-get install -y python3 python3-pip build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

CMD ["/bin/bash"]
