# Callback Reassign Babel Plugin

A babel plugin for callback reassign.

## Install

```shell
npm i @callback-reassign/babel-plugin -D
```

## Config

.babelrc.json or babel.config.js

```javascript
{
    plugins: [
      [
        "@callback-reassign/babel-plugin",
        {
          targetFns: {
            "a-package": {
              default: 1, // export default
              fn1: 1,
              fn2: 1,
              fn3: -1,
            },
          },
        },
      ],
    ],
  };
```

## License

MIT @anuoua
