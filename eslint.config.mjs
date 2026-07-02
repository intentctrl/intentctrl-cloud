import { globalIgnores } from "eslint/config";
import { nextJsConfig } from "@intentctrl-cloud/eslint-config/next";
import { config as baseConfig } from "@intentctrl-cloud/eslint-config/base";

function scope(configs, files) {
  return configs.map((cfg) => ({ ...cfg, files }));
}

export default [
  globalIgnores(["**/node_modules/**", "**/.turbo/**"]),

  ...scope(nextJsConfig, ["apps/dashboard/**"]),
  ...scope(baseConfig, ["apps/api/**", "packages/db/**", "packages/types/**"]),
];
