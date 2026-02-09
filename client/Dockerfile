# Stage 1: Build the client application
FROM node:21 AS client-builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application for production
FROM node:21-slim

WORKDIR /app

# Copy the built application from the client-builder stage
COPY --from=client-builder /app .

# Expose the port that the Vite development server will run on
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]