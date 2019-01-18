FROM node:8

WORKDIR /app
RUN npm install -g typescript

COPY package.json /app
RUN npm install

COPY . /app
RUN tsc

ENTRYPOINT ["node"]