# Stage 1: Build & Test
FROM node:21 AS backend-builder

# Setup the working dir
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install packages
RUN npm install

# Copy the rest of the code
COPY . .

# Run tests to ensure everything is working before we build the production image
RUN npm run test

# Stage 2: Production Image
FROM node:21-slim

# Setup the working dir
WORKDIR /app

# Copy only the necessary files from the builder stage to keep the image lean
COPY --from=backend-builder /app .

# Expose the port the app runs on
EXPOSE 8000 

# Start the application
CMD ["npm", "start"]