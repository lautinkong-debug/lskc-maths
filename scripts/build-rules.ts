import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

export type AccessMode = "public" | "school";
export interface RulesConfig {
  mode: AccessMode;
  domains: string[];
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function readRulesConfig(): RulesConfig {
  loadEnv({ path: resolve(root, ".env.local"), quiet: true });
  const mode = process.env.NEXT_PUBLIC_ACCESS_MODE;
  if (mode !== "public" && mode !== "school") {
    throw new Error("NEXT_PUBLIC_ACCESS_MODE must be public or school.");
  }
  const domains = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
  if (
    domains.length === 0 ||
    domains.some((domain) => !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain))
  ) {
    throw new Error(
      "Set NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS to valid comma-separated domains.",
    );
  }
  return { mode, domains };
}

export function renderRule(template: string, config: RulesConfig): string {
  const escapedDomains = config.domains.map((domain) =>
    domain.replaceAll(".", "\\."),
  );
  const pattern = `^[^@]+@(${escapedDomains.join("|")})$`;
  return template
    .replaceAll("__DOMAIN_PATTERN__", JSON.stringify(pattern))
    .replaceAll("__PUBLIC_READ__", config.mode === "public" ? "true" : "false");
}

export function renderRules(config: RulesConfig) {
  return {
    firestore: renderRule(
      readFileSync(resolve(root, "rules/firestore.rules.template"), "utf8"),
      config,
    ),
    storage: renderRule(
      readFileSync(resolve(root, "rules/storage.rules.template"), "utf8"),
      config,
    ),
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const config = readRulesConfig();
  const rules = renderRules(config);
  writeFileSync(resolve(root, "firestore.rules"), rules.firestore);
  writeFileSync(resolve(root, "storage.rules"), rules.storage);
  process.stdout.write(
    `Built ${config.mode} rules for ${config.domains.join(", ")}\n`,
  );
}
