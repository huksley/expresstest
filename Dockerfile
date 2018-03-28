FROM node:8.10-alpine
WORKDIR /src
COPY . .
RUN npm install
RUN npm build
EXPOSE 3000
CMD ["npm", "start"]
