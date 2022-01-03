FROM node:14
WORKDIR /app
COPY src/ src/
COPY examples/ examples/
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
ENV TZ="Asia/Kolkata"
RUN yarn install
RUN yarn build
ENV PORT=3001
EXPOSE 3001
CMD yarn start
