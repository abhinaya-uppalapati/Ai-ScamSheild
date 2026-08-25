# Optional container build for the frontend. For most deployments, Vercel
# (see root README) is simpler — this Dockerfile is provided for teams that
# want to self-host everything, e.g. alongside backend/ai-service on one VM.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
