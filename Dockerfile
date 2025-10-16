FROM denoland/deno:alpine

WORKDIR /app

COPY . .

# Cache dependencies
RUN deno cache server.ts

CMD ["run", "--allow-net", "--allow-env", "--import-map=deno.json", "server.ts"]
