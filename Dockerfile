FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
RUN mkdir -p uploads data
ENV PORT=5000
EXPOSE 5000
CMD ["node", "src/server.js"]
