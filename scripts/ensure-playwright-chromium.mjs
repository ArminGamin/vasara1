import { execSync } from "node:child_process";

if (process.env.SKIP_PRERENDER === "1") process.exit(0);
if (process.env.VERCEL === "1") process.exit(0);

execSync("npx playwright install chromium", { stdio: "inherit" });
