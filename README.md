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

### run the server

```bash
bun turbo
```
