# Use a base Node.js image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /src

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your Express app listens on
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]