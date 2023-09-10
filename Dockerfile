FROM node:14.21.3

COPY . /app

RUN cd /app && \
    npm install && \
    npm run build && \
    npm prune

EXPOSE 6001

WORKDIR /app

ENTRYPOINT ["node", "/app/bin/server.js", "start"]
