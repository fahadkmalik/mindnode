# Deployment Guide

This application is built with React using Vite. It can be easily deployed to various platforms.

## Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy Vite applications.

1.  **Push your code to GitHub/GitLab/Bitbucket**.
2.  **Login to [Vercel](https://vercel.com/)**.
3.  **Click "Add New..." -> "Project"**.
4.  **Import your repository**.
5.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
    *   (These should be detected automatically)
6.  **Click "Deploy"**.

### Troubleshooting Vercel Routing
If you encounter 404 errors on refresh, create a `vercel.json` file in the root directory:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Deploying to Coolify (Self-Hosted)

Coolify is a self-hostable Heroku/Vercel alternative.

### Option 1: Using Nixpacks (Easiest)
1.  **Dashboard**: Go to your Coolify dashboard.
2.  **New Resource**: Select **Public Repository** (or Private if configured).
3.  **URL**: Enter your git repository URL.
4.  **Build Pack**: Select **Nixpacks**.
5.  **Configuration**:
    *   **Port Exposes**: `80` (Coolify usually handles this via reverse proxy).
    *   **Install Command**: `npm ci`
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm run preview -- --host --port $PORT` (For simple preview) 
    *   **BETTER PRODUCTION SETUP**: It's recommended to serve the static files using a high-performance server like Nginx within the container, but for simplicity with Nixpacks, you can use `serve`.
    
    **Recommended Start Command for SPA**:
    ```bash
    npx serve -s dist -l $PORT
    ```

### Option 2: Dockerfile
Create a `Dockerfile` in your root directory:

```dockerfile
# Build Stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

And create an `nginx.conf`:

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

Then in Coolify, select **Dockerfile** as the build pack.

## Environment Variables
If you use any environment variables (e.g., API keys), ensure they are added in the deployment settings of Vercel or Coolify.
