FROM node:16.17-alpine

WORKDIR /usr
COPY package.json ./
#COPY .env ./
COPY tsconfig.json ./
COPY src ./src
COPY db-management ./db-management
COPY .db-migraterc ./
COPY types ./types
RUN ls -a
RUN npm install
RUN npm run build

EXPOSE 8080

# CMD [ "node", "./build/server.js" ]
CMD [ "npm", "run", "start-prod" ]