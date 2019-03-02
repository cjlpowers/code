#
# ---- Dependencies ----
FROM node:8 AS dependencies
WORKDIR /app

# install node modules
COPY package.json ./
RUN mkdir node_modules
RUN npm install --only=production
RUN cp -R node_modules prod_node_modules
RUN npm install

#
# ---- Build ----
FROM dependencies AS build
WORKDIR /app

# install TypeScript compiler
RUN npm set progress=false && npm config set depth 0

# build source
COPY tsconfig.json ./
COPY tsconfig.module.json ./
COPY tslint.json ./
COPY src ./src
RUN npm run ci

#
# ---- Release ----
FROM node:8-slim AS release

EXPOSE 80/tcp

WORKDIR /app

# copy production node_modules
COPY --from=dependencies /app/prod_node_modules ./node_modules

# copy dist artifacts
COPY --from=build /app/build/main ./
COPY package.json ./

ENTRYPOINT ["node","."]