# Deadspace

## setup dev environment

Make sure you have bun, docker and docker-compose installed.

```bash
docker-compose up -d postgres
```

### generate and run migrations

```bash
bun db:generate
bun db:migrate
```

after creating the tables and all run

```bash
bunx drizzle-kit generate --custom
```

and copy the contents from all of the .sql in src/schema into the genrated file and run

```bash
bun db:migrate
```

this is necessary because the drizzle doesnt support check constraints at the moment and we need to add them manually.

### run the server

```bash
bun turbo
```
