import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = "apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.glb";
const welded = "apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.welded.tmp.glb";
const optimized = "apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.optimized.glb";
const npxCommand = process.platform === "win32"
  ? [process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npx.cmd"]]
  : ["npx", []];

function run(args) {
  const [command, prefixArgs] = npxCommand;
  const result = spawnSync(command, [...prefixArgs, "--yes", "@gltf-transform/cli", ...args], {
    cwd: repoRoot,
    stdio: "inherit"
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(resolve(repoRoot, source))) {
  console.error(`Missing source GLB: ${source}`);
  process.exit(1);
}

run(["inspect", source]);
run(["weld", source, welded]);
run(["simplify", welded, optimized, "--ratio", "0.25", "--error", "0.01"]);
rmSync(resolve(repoRoot, welded), { force: true });
run(["inspect", optimized]);
