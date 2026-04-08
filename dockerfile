FROM node:20 AS build

WORKDIR /app

ARG VITE_CORE_BACKEND_URL
ARG VITE_AUTH_BACKEND_URL
ENV VITE_CORE_BACKEND_URL=$VITE_CORE_BACKEND_URL
ENV VITE_AUTH_BACKEND_URL=$VITE_AUTH_BACKEND_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Add our config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]