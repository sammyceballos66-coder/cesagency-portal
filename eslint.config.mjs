import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
    // Sibling Next.js projects nested inside this directory — not part of
    // cesagency-portal, have their own configs/dependencies.
    "aicontador-web/**",
    "renault-pereira-web/**",
    "quality-barber-shop-web/**",
    // Third-party Claude Code skill scripts (ui-ux-pro-max) — not app code.
    ".claude/**",
  ]),
]);

export default eslintConfig;
