FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Expose the websocket port
EXPOSE 1234

# Start the y-websocket server
CMD ["npm", "start"]
