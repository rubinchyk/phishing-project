FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Map compose build arg to Vite env var at build time
ARG REACT_APP_API_URL
ENV VITE_API_URL=${REACT_APP_API_URL}

RUN npm run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./

# SPA history fallback: serve index.html for unknown routes
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
