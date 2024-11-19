FROM ubuntu:24.04

RUN apt-get -y update && apt-get -y install curl && mkdir -p /root/node_modules && chown -R root:root /root && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash && . ~/.nvm/nvm.sh && . ~/.bashrc && nvm install 14.17.5 && nvm alias default 14.17.5 && nvm use 14.17.5

WORKDIR /root

COPY package.json ./

RUN . ~/.bashrc && npm install --save-dev @babel/core && npm install

# ENTRYPOINT ["/bin/bash"]

