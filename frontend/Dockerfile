FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --global npm@12.2.1 && npm install --no-audit --no-fund --legacy-peer-deps
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
