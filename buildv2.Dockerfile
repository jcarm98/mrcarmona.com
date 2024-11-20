FROM ubuntu:24.04

RUN apt-get -y update && apt-get -y install curl && mkdir -p /root/node_modules && chown -R root:root /root && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash && . ~/.nvm/nvm.sh && . ~/.bashrc && nvm install 18.19.0 && nvm alias default 18.19.0 && nvm use 18.19.0

WORKDIR /root

COPY package.json ./

COPY public ./public

COPY src ./src

RUN . ~/.bashrc && npm install

ENTRYPOINT ["/bin/sh", "-c", ". ~/.bashrc && npm run build"]

