/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  parser: "@typescript-eslint/parser",

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:astro/recommended",
    "plugin:react/recommended", // si usas React
    "plugin:prettier/recommended",
  ],

  plugins: ["@typescript-eslint", "astro", "react"],

  env: {
    browser: true,
    node: true,
    es2022: true,
  },

  settings: {
    react: {
      version: "detect",
    },
  },

  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
  ],

  rules: {
    // 🔥 reglas útiles reales
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],

    "react/react-in-jsx-scope": "off", // React 17+

    "prettier/prettier": "warn",
  },
};
