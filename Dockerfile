FROM imbios/bun-node:1.1.22-22.6.0-slim

WORKDIR /app

COPY package.json .

COPY bun.lockb .

RUN bun install

COPY . .

RUN bun run build

CMD ["bun", "run", "start"]