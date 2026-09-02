FROM node:22-alpine
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH=":/root/.local/bin:/root/.local/bin:/root/.antigravity-ide-server/bin/2.5.5-ecfbad74d93962fc8ca485d93ab9b4f3d4cb6cf8/bin/remote-cli:/root/.local/bin:/root/.local/bin:/root/.nvm/versions/node/v25.6.0/bin:/root/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
RUN npm install -g pnpm@9.15.4

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

RUN cp -r .next/static .next/standalone/.next/static &&     mkdir -p .next/standalone/public &&     cp -r public/* .next/standalone/public/

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]
