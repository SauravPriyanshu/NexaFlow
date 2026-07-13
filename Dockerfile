# Use the official Node.js Alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the backend source code
COPY backend/ ./

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
