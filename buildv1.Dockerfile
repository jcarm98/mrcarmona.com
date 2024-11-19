FROM jc/base/reactv1

WORKDIR /root

COPY public ./public

COPY src ./src

RUN . ~/.bashrc && npm run build

# ENTRYPOINT ["/bin/bash"]
ENTRYPOINT . ~/.bashrc && npm run build

