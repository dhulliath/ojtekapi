
#FROM node:12-alpine
FROM andreysenov/node-gyp
ENV NODE_ENV=production
# RUN mkdir -p /app
WORKDIR /express-docker
COPY . .
#RUN apk add python make gcc g++
RUN ls -als
RUN npm install --no-package-lock
CMD [ "npm", "start"]
EXPOSE 3000