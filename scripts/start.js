// scripts/start.js
// This script runs the Next.js server AND the cron job together.
// Called by "npm start" in production.

const { execSync, spawn } = require("child_process");
const path = require("path");

// Run DB migration before starting
console.log("🔄 Running database migrations...");
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅ Database ready");
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
}

// Seed initial news
console.log("📰 Fetching initial news...");
try {
  execSync("node scripts/seed.js", { stdio: "inherit" });
} catch (e) {
  console.warn("Seed skipped:", e.message);
}

// Start Next.js server
const server = spawn("node", [".next/standalone/server.js"], {
  stdio: "inherit",
  env: { ...process.env, PORT: process.env.PORT || "3000" },
});

// Start cron job process
const cron = spawn("node", ["scripts/cron.js"], {
  stdio: "inherit",
  env: process.env,
});

server.on("exit", (code) => {
  console.log("Server exited:", code);
  cron.kill();
  process.exit(code);
});

cron.on("exit", (code) => {
  console.log("Cron exited:", code);
});

process.on("SIGTERM", () => {
  server.kill("SIGTERM");
  cron.kill("SIGTERM");
});
