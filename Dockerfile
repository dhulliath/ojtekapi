
#FROM node:12-alpine
FROM andreysenov/node-gyp
ENV NODE_ENV=production
# RUN mkdir -p /app
WORKDIR /express-docker
COPY . .
#COPY .appvariables.json .
#RUN apk add python make gcc g++
#RUN chmod -R 777 *
RUN npm install --no-package-lock
CMD [ "npm", "start"]
EXPOSE 3000