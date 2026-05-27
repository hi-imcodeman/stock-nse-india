FROM node:20
WORKDIR /app
COPY src/ src/
COPY examples/ examples/
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
ENV TZ="Asia/Kolkata"
ENV HUSKY=0
RUN yarn install --frozen-lockfile
RUN yarn build
ENV PORT=3001
EXPOSE 3001
CMD ["node", "build/server.js"]
