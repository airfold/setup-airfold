import globals from "globals";
import jest from "eslint-plugin-jest";
import babelParser from "@babel/eslint-parser";

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.jest,
      },
      parser: babelParser,
    },
    plugins: {
      jest: jest,
    },
    rules: {
      "eol-last": "off",
      "brace-style": "off",
      "comma-dangle": "off",
      "comma-spacing": "off",
      eqeqeq: "off",
      indent: "off",
      "key-spacing": "off",
      "keyword-spacing": "off",
      "max-len": "off",
      "no-ex-assign": "off",
      "no-extra-boolean-cast": "off",
      "no-multi-spaces": "off",
      "no-throw-literal": "off",
      "no-unreachable": "off",
      "object-curly-spacing": ["error", "always"],
      radix: "off",
      "quote-props": "off",
      quotes: [
        "error",
        "double"
      ],
      "space-before-function-paren": "off",
      "space-in-parens": "off",
      "space-infix-ops": "off",
      "space-unary-ops": "off",
      "spaced-comment": "off",
      semi: ["error", "always"],
    },
    ignores: ["dist/**/*"],
  }
];
