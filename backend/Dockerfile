FROM node:20.18.0-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies (including dev)
RUN npm install --include=dev

# Copy source code
COPY . .

# Build the TypeScript code
RUN npx tsc -p tsconfig.json

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"]
