import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/** eslint-config-next 16 ships flat configs, so no FlatCompat shim is needed. */
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Emscripten's generated loader; it is build output, not source.
      "public/engine/**",
      "engine/build/**",
    ],
  },
];

export default eslintConfig;
