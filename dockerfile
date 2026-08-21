# Use an official Node.js runtime as a parent image
FROM node:24

# Set the working directory in the container
WORKDIR /usr/src/jsm-nestjs

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Build the application if necessary
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
