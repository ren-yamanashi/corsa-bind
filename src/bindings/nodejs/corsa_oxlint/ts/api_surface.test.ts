import { describe, expect, it } from "vitest";

import * as main from "./index";
import * as rules from "./rules";
import * as tsoxlintEntry from "./ts_oxlint";
import * as tsestreeEntry from "./ts_estree";

describe("api surface", () => {
  it("re-exports the ts-oxlint compatibility entrypoint", () => {
    expect(typeof tsoxlintEntry.tsoxlint.config).toBe("function");
    expect(tsoxlintEntry.tsoxlint.parser.meta.name).toBe("corsa-oxlint/parser");
  });

  it("re-exports ts-estree helpers from the root entry", () => {
    expect(main.TSESTree.AST_NODE_TYPES.Program).toBe("Program");
    expect(tsestreeEntry.AST_NODE_TYPES.Identifier).toBe("Identifier");
  });

  it("re-exports the native rules surface from both entrypoints", () => {
    expect(typeof main.rules.corsaOxlintPlugin).toBe("object");
    expect(rules.implementedNativeRuleNames).toContain("restrict-plus-operands");
  });
});
