# ============================================
# Stage 1: Build Angular Application
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with specified configuration (default: production)
ARG BUILD_CONFIGURATION=production
ARG API_KEY=YOUR_TOKEN_HERE

# Create .env from build arg so set-env.js can read it
RUN echo "SUPERHERO_API_KEY=${API_KEY}" > .env
RUN npm run build -- --configuration=${BUILD_CONFIGURATION}

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from build stage
# Angular 22 application builder outputs browser files to dist/crud-challenge/browser
COPY --from=build /app/dist/crud-challenge/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
