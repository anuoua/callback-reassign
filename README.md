# Callback Reassign

A compilation strategy for refreshing declared variables. The front-end framework [Unis](https://www.github.com/anuoua/unis) uses this strategy to develop its component API.

## Compilation Example

Specify the target function for compilation

```javascript
{
  targetFns: {
    // package name
    'a-package': {
      // the exported function variable of the package, default represents the default exported function
      default: 1, // the number indicates the position where the callback function is inserted, starting from 0.
      fn1: 1,
      fn2: 1,
    }
  }
}
```

Code

```javascript
import fn0, { fn1, fn2 } from "a-package";

let [k, setK] = fn0("a");
let { b } = fn1("a");
let a = fn2("a");
let c = fn2();
```

Compilation Result

```javascript
import fn0, { fn1, fn2, fn3 } from "a-package";

let [k, setK] = fn0("a", ([$0, $1]) => (k = $0; setK = $1));
let { b } = fn1("a", ({ b: $0 }) => {
  b = $0;
});
let a = fn2("a", $ => a = $);
let c = fn2(undefined, $ => c = $);
```

## License

MIT @anuoua
