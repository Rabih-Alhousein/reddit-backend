FROM node:20

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# Install TypeScript globally
RUN yarn global add typescript

COPY . .
# COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 4000
CMD [ "node", "dist/index.js" ]
USER node