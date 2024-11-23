FROM jc/portfolio/v2/base

EXPOSE 3000

WORKDIR /root

RUN mkdir -p /root/public && mkdir -p /root/src

ENTRYPOINT ["/bin/sh", "-c", ". ~/.bashrc && npm run start"]

