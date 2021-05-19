# @philter/common

This package provides code shared between OCD-Cleanup Manager's frontend and
backend repositories. This includes various type definitions, constants, and
executable code.

As such, this code must satisfy the following:

- Emit code that can be executed in KoLmafia's JavaScript runtime
  - No use of browser-specific APIs
  - No use of JavaScript functions unavailable in KoLmafia
- Emit code that can be executed in web browsers
  - No imports from `kolmafia` (including types)
  - No imports from Node.js builtin modules
- Emit code that can be executed in Node.js (native ESM)
  - Always use `.js` extension when importing modules, even in TypeScript
