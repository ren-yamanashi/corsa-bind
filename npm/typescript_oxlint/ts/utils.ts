import {
  Utils as NodeUtils,
  classifyTypeText,
  isAnyLikeTypeTexts,
  isArrayLikeTypeTexts,
  isBigIntLikeTypeTexts,
  isErrorLikeTypeTexts,
  isNumberLikeTypeTexts,
  isPromiseLikeTypeTexts,
  isStringLikeTypeTexts,
  isUnknownLikeTypeTexts,
  splitTopLevelTypeText,
  splitTypeText,
} from "@tsgo-rs/node";

export type { TypeTextKind } from "@tsgo-rs/node";

export {
  classifyTypeText,
  isAnyLikeTypeTexts,
  isArrayLikeTypeTexts,
  isBigIntLikeTypeTexts,
  isErrorLikeTypeTexts,
  isNumberLikeTypeTexts,
  isPromiseLikeTypeTexts,
  isStringLikeTypeTexts,
  isUnknownLikeTypeTexts,
  splitTopLevelTypeText,
  splitTypeText,
};

export const Utils = NodeUtils;
