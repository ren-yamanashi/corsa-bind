export const TSOxlint = Object.freeze({});

export const tsoxlint = Object.freeze({
  config(...configs: readonly unknown[]) {
    return configs.flat();
  },
  configs: Object.freeze({}),
  parser: Object.freeze({
    meta: {
      name: "corsa-oxlint/parser",
      version: "0.1.0",
    },
    parseForOxlint() {
      throw new Error(
        "corsa-oxlint relies on oxlint for parsing; use it as an Oxlint JS plugin instead",
      );
    },
  }),
  plugin: Object.freeze({
    configs: Object.freeze({}),
    rules: Object.freeze({}),
  }),
});
