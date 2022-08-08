/* eslint-disable @typescript-eslint/no-var-requires */
const restrictedGlobals = require("confusing-browser-globals");
/* eslint-enable @typescript-eslint/no-var-requires */
const allRestrictedGlobals = restrictedGlobals.concat(["isFinite", "isNaN"]);
const allRestrictedGlobalsWithMessage = allRestrictedGlobals.map((name) => ({
  name,
  message: `Looks like you are using the '${name}' global, did you mean to make a local variable called '${name}'?`,
}));

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  settings: {
    react: { version: "detect" },
  },
  plugins: ["react", "@typescript-eslint", "import"],
  rules: {
    "no-warning-comments": "error",
    "no-console": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/react-in-jsx-scope": "off",
    "react/jsx-curly-brace-presence": [2, "never"],
    "react/jsx-boolean-value": ["error", "never"],
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    "import/no-default-export": "error",
    "import/no-cycle": "error",
    // Prefer to import from react-router-dom, see:
    // https://www.reddit.com/r/reactjs/comments/qqg0gz/typeerror_cannot_read_properties_of_undefined/
    "no-restricted-imports": ["error", "react-router"],
    "react-hooks/rules-of-hooks": "error",
    "no-restricted-globals": ["error"].concat(allRestrictedGlobalsWithMessage),
    "react-hooks/exhaustive-deps": [
      "error",
      {
        additionalHooks: "(useStore)",
      },
    ],
    eqeqeq: "error",
    "no-unsafe-optional-chaining": [
      "error",
      { disallowArithmeticOperators: true },
    ],
    "@typescript-eslint/prefer-optional-chain": ["error"],
  },
  overrides: [
    {
      files: ["**/*stories.tsx"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
