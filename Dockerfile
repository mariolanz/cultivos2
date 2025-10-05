# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve or vite for production preview
RUN npm install -g vite

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5000"]
