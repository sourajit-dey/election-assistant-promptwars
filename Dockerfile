# Use the official Nginx image
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static website files to the nginx html directory
COPY . /usr/share/nginx/html

# Cloud Run requires the container to listen on port 8080 (which we set in nginx.conf)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
