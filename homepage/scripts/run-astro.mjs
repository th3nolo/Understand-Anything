#!/usr/bin/env node
// Run the local Astro CLI with build telemetry disabled by default.
//
// Astro's CLI emits anonymous build telemetry unless ASTRO_TELEMETRY_DISABLED
// is set. This wrapper sets it in-process before delegating to the real Astro
// binary, so every homepage dev/build/preview is telemetry-free out of the box
// — on macOS, Linux and Windows alike — without adding an npm dependency
// (e.g. cross-env). An ASTRO_TELEMETRY_DISABLED already present in the
// environment is respected as-is (so it can still be overridden if ever needed).
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const astroPkgPath = require.resolve("astro/package.json");
const astroPkg = require("astro/package.json");
const binRel =
  typeof astroPkg.bin === "string" ? astroPkg.bin : astroPkg.bin.astro;
const astroEntry = path.join(path.dirname(astroPkgPath), binRel);

if (process.env.ASTRO_TELEMETRY_DISABLED === undefined) {
  process.env.ASTRO_TELEMETRY_DISABLED = "1";
}

const child = spawn(process.execPath, [astroEntry, ...process.argv.slice(2)], {
  stdio: "inherit",
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
