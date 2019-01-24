#
# ---- Dependencies ----
FROM node:8 AS dependencies
WORKDIR /app

# install node modules
COPY package.json ./
RUN npm install --only=production 
RUN cp -R node_modules prod_node_modules
RUN npm install

#
# ---- Build ----
FROM dependencies AS build
WORKDIR /app

# install TypeScript compiler
RUN npm set progress=false && npm config set depth 0
RUN npm install -g typescript

# build source
COPY tsconfig.json ./
COPY src ./src
RUN tsc

#
# ---- Release ----
FROM node:8-slim AS release
WORKDIR /app

# copy production node_modules
COPY --from=dependencies /app/prod_node_modules ./node_modules

# copy dist artifacts
COPY --from=build /app/dist ./

ENTRYPOINT ["node"]