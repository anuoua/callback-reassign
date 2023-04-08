import { describe, it, expect } from "vitest";
import { InputOptions, OutputOptions, rollup } from "rollup";
import { reassign } from "../src/index";

const transformed = `import at, { bt } from 'test';
import ct from 'test2';

function main() {
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
}

export { main };
`;

describe("test", () => {
  it("transform", async () => {
    const inputOptions: InputOptions = {
      input: "./test/reassign.js",
      plugins: [
        reassign({
          sourcemap: true,
          targetFns: {
            test: {
              default: 1,
              bt: 1,
            },
            test2: {
              default: 1,
            },
          },
        }),
      ],
      external: ["test", "test2"],
    };
    const outputOptions: OutputOptions = {
      file: "bundle.js",
      format: "esm",
    };

    const bundle = await rollup(inputOptions);

    const { output } = await bundle.generate(outputOptions);

    for (let chunk of output) {
      // @ts-ignore
      expect(chunk.code).toBe(transformed);
    }
  });
});
