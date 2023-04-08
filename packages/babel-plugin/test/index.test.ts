import { it, expect } from "vitest";
import * as babel from "@babel/core";
import reassignPlugin from "../src";

const code = `
import at, { bt } from "test";
import ct from "test2";

export function main() {
  let {
    a: {
      b: { c = 1 },
      ...d
    },
    f: { j = 1, ["k"]: ki } = {},
    k: [{ u }] = [],
    ...e
  } = at("hello");
  let [{ f: g }] = bt("hello");
  let a = bt("hello");
  let h = at();
  let p = ct("hello");

  return {
    a,
    c,
    d,
    j,
    ki,
    e,
    g,
    h,
    p,
  };
}
`;

const transformed = `import at, { bt } from "test";
import ct from "test2";
export function main() {
  let {
    a: {
      b: {
        c = 1
      },
      ...d
    },
    f: {
      j = 1,
      ["k"]: ki
    } = {},
    k: [{
      u
    }] = [],
    ...e
  } = at("hello", ({
    a: {
      b: {
        c: $0 = 1
      },
      ...$1
    },
    f: {
      j: $2 = 1,
      ["k"]: $3
    } = {},
    k: [{
      u: $4
    }] = [],
    ...$5
  }) => {
    c = $0;
    d = $1;
    j = $2;
    ki = $3;
    u = $4;
    e = $5;
  });
  let [{
    f: g
  }] = bt("hello", ([{
    f: $0
  }]) => {
    g = $0;
  });
  let a = bt("hello", $0 => {
    a = $0;
  });
  let h = at(undefined, $0 => {
    h = $0;
  });
  let p = ct("hello", $0 => {
    p = $0;
  });
  return {
    a,
    c,
    d,
    j,
    ki,
    e,
    g,
    h,
    p
  };
}`;

it("test", async () => {
  const result = babel.transform(code, {
    plugins: [
      [
        reassignPlugin,
        {
          targetFns: {
            test: {
              default: 1,
              bt: 1,
            },
            test2: {
              default: 1,
            },
          },
        },
      ],
    ],
  });

  expect(result?.code).toBe(transformed);
});
