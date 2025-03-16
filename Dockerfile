FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN addgroup -S sdkgroup && adduser -S sdkuser -G sdkgroup

USER sdkuser

EXPOSE 3000

CMD ["pnpm", "local"]