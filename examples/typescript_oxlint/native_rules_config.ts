import { typescriptOxlintPlugin } from "typescript-oxlint/rules";

import { createExampleParserOptions } from "./shared.ts";

const config = [
  {
    settings: {
      typescriptOxlint: {
        parserOptions: createExampleParserOptions(),
      },
    },
    plugins: {
      typescript: typescriptOxlintPlugin,
    },
    rules: {
      "typescript/no-floating-promises": "error",
      "typescript/prefer-promise-reject-errors": "error",
      "typescript/restrict-plus-operands": ["error", { allowNumberAndString: false }],
    },
  },
];

export default config;
