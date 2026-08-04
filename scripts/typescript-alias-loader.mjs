import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = process.cwd();

function withExtension(candidate) {
  if (existsSync(candidate)) return candidate;
  for (const extension of [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"]) {
    if (existsSync(`${candidate}${extension}`)) return `${candidate}${extension}`;
  }
  return candidate;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return nextResolve(pathToFileURL(withExtension(path.join(repoRoot, specifier.slice(2)))).href, context);
  }
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    try {
      return await nextResolve(specifier, context);
    } catch (error) {
      if (!context.parentURL?.startsWith("file://")) throw error;
      return nextResolve(pathToFileURL(withExtension(new URL(specifier, context.parentURL).pathname)).href, context);
    }
  }
  return nextResolve(specifier, context);
}
