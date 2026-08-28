import { execFileSync } from "node:child_process";
import { realpathSync, rmSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "..");

function listUntrackedLogFiles(ignoredOnly: boolean): string[] {
  const args = ["ls-files", "--others", "--exclude-standard"];
  if (ignoredOnly) args.push("--ignored");
  args.push("*.log");

  const output = execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf-8",
  });
  return output.split("\n").filter(Boolean);
}

// --exclude-standard alone drops any .log file that already matches a
// .gitignore pattern (e.g. npm-debug.log*) instead of finding it - pairing
// it with --ignored flips to the opposite, ignored-only set. Neither call
// alone covers every .log file, so both are needed; --exclude-standard
// still does its job either way, pruning most of the tree via .gitignore.
//
// node_modules/ is filtered separately rather than left to that same
// mechanism: it's gitignored too, so the --ignored pass would otherwise
// also reach genuine .log files shipped inside installed packages, which
// isn't what "this repo's logs" means - every tsconfig.json and
// eslint.config.js in this repo already draws the same line.
const candidates = [
  ...new Set([...listUntrackedLogFiles(false), ...listUntrackedLogFiles(true)]),
].filter((relativePath) => !relativePath.startsWith("node_modules/"));

// A yarn workspace symlinks each package into node_modules/<name>, so the
// same physical file can also be reachable through that alias - dedupe by
// real path, and skip anything already gone by the time we get to it, so
// "Removed X" only prints for a path that this run actually removed.
const seen = new Set<string>();
let removedCount = 0;

for (const relativePath of candidates) {
  const filePath = join(repoRoot, relativePath);
  let realPath: string;
  try {
    realPath = realpathSync(filePath);
  } catch {
    continue;
  }
  if (seen.has(realPath)) continue;
  seen.add(realPath);

  rmSync(filePath, { force: true });
  console.log(`Removed ${relativePath}`);
  removedCount++;
}

if (removedCount === 0) {
  console.log("No log files found.");
}
