FROM node:alpine
WORKDIR /app
COPY package.json .
ENV http_proxy="http://apac.zscaler.philips.com:9480"
ENV https_proxy="http://apac.zscaler.philips.com:9480"
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]