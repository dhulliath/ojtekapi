
#FROM node:12-alpine
FROM andreysenov/node-gyp
ENV NODE_ENV=production
# RUN mkdir -p /app
WORKDIR /app
COPY ./package.json ./package-lock.json ./
#RUN apk add python make gcc g++
RUN npm install
COPY ./ .
EXPOSE 3000
CMD [ "npm", "start"]