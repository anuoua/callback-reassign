# Callback Reassign

一种刷新声明变量的编译策略。前端框架 [Unis](https://www.github.com/anuoua/unis) 使用此策略开发了框架的组件 API。

## 编译示例

指定编译目标函数

```javascript
{
  targetFns: {
    // 包名
    'a-package': {
      // 包导出的函数变量，default 表示默认导出的函数
      default: 1, // 数字表示的是插入回调函数的位置，以 0 为起始位置。
      fn1: 1,
      fn2: 1,
    }
  }
}
```

代码

```javascript
import fn0, { fn1, fn2 } from "a-package";

let [k, setK] = fn0("a");
let { b } = fn1("a");
let a = fn2("a");
let c = fn2();
```

编译结果

```javascript
import fn0, { fn1, fn2, fn3 } from "a-package";

let [k, setK] = fn0("a", ([$0, $1]) => (k = $0; setK = $1));
let { b } = fn1("a", ({ b: $0 }) => {
  b = $0;
});
let a = fn2("a", $ => a = $);
let c = fn2(undefined, $ => c = $);
```

## 证书

MIT @anuoua
