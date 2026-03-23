import { spawn } from "node:child_process";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, retries = 60) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) return;
    } catch {
      // ignore until server is up
    }
    await wait(1000);
  }

  throw new Error(`Server did not start in time: ${url}`);
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const processRef = spawn(command, args, {
      shell: true,
      stdio: "inherit",
      env: process.env,
    });

    processRef.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${command} ${args.join(" ")}`));
      }
    });

    processRef.on("error", reject);
  });
}

const devServer = spawn("npx", ["next", "dev", "--port", "3200"], {
  shell: true,
  stdio: "inherit",
  env: process.env,
});

try {
  await waitForServer("http://localhost:3200");
  await runCommand("npx", [
    "lighthouse",
    "http://localhost:3200",
    "--chrome-flags=--headless --no-sandbox",
    "--only-categories=performance,accessibility,best-practices,seo",
    "--output=html",
    "--output-path=./reports/lighthouse-home.html",
  ]);
} finally {
  devServer.kill("SIGTERM");
}
