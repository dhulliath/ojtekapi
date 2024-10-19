
FROM node:12-alpine
ENV NODE_ENV=production
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY ./ .
EXPOSE 3000
CMD [ "npm", "start"]