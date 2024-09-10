# Deadspace

## setup dev environment

Make sure you have bun, docker and docker-compose installed.

```bash
docker-compose up -d postgres
```

### generate and run migrations

Make sure to copy the contents of trigger.sql in the src/schema folder to any of the generated migration files before running the migration script.

```bash
bun db:generate
bun db:migrate
```

### run the server

```bash
bun turbo
```
