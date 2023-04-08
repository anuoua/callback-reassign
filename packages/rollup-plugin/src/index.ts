import type { Plugin } from "rollup";
import * as babelCore from "@babel/core";
import reassignBabel from "@callback-reassign/babel-plugin";
import { createFilter, FilterPattern } from "@rollup/pluginutils";

export interface ReassignOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  sourcemap?: boolean;
  targetFns: Record<string, Record<string, number>>;
}

export function reassign(options: ReassignOptions): Plugin {
  const { targetFns, include, exclude, sourcemap = true } = options;

  const idFilter = createFilter(include, exclude);

  return {
    name: "callback-reassign",
    transform(code, id: string) {
      if (!idFilter(id)) return;

      const result = babelCore.transform(code, {
        plugins: [[reassignBabel, { targetFns }]],
      });

      return {
        code: result?.code ?? "",
        map: sourcemap ? result?.map : null,
      };
    },
  };
}
