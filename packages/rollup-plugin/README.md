# Callback Reassign Rollup Plugin

A rollup plugin for callback reassign.

## Install

```shell
npm i @callback-reassign/rollup-plugin -D
```

## Config

rollup.config.js

```typescript
import { reassign } from "@callback-reassign/rollup-plugin";

export default {
  plugins: [
    reassign({
      targetFns: {
        "a-package": {
          default: 1, // export default
          fn1: 1,
          fn2: 1,
          fn3: -1,
        },
      },
    }),
  ],
};
```

## License

MIT @anuoua
