import { defineConfig } from "drizzle-kit"

import dotenv from "dotenv"

dotenv.config({
  path: ".env.local",
})

console.log("->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + process.env.DB_URL)

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
})
