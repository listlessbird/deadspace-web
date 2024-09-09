import { defineConfig } from "drizzle-kit"

console.log("->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + process.env.DB_URL)

export default defineConfig({
  schema: "./src/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
})
