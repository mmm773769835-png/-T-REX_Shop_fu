FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose the port the app runs on
EXPOSE 8081

# Start the application
CMD ["npm", "run", "web"]