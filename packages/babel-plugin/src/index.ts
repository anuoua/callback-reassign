import * as babelCore from "@babel/core";
import { types, PluginObj, traverse, template } from "@babel/core";

const REASSIGN_FLAG = "$";
const t = types;

export interface Config {
  targetFns: Record<string, Record<string, number>>;
}

export default function (babel: typeof babelCore, config: Config): PluginObj {
  const finallyFns: Record<string, number> = {};
  const fnsOverride: Record<string, boolean> = {};

  return {
    name: "callback-reassign",
    visitor: {
      // get finallyFns
      Program(path) {
        const imports = path.node.body.filter((node) => {
          return t.isImportDeclaration(node);
        }) as types.ImportDeclaration[];

        const hit = (packageName: string, name: string) => {
          return !!config.targetFns[packageName]?.[name];
        };

        const getIndex = (packageName: string, name: string) => {
          return config.targetFns[packageName][name];
        };

        const add = (name: string, index: number) => {
          finallyFns[name] = index;
        };

        imports.forEach((importStatement) => {
          const packageName = importStatement.source.value;
          importStatement.specifiers.map((specifier) => {
            if (t.isImportDefaultSpecifier(specifier)) {
              hit(packageName, "default") &&
                add(specifier.local.name, getIndex(packageName, "default"));
            }
            if (t.isImportSpecifier(specifier)) {
              hit(
                packageName,
                t.isStringLiteral(specifier.imported)
                  ? specifier.imported.value
                  : specifier.imported.name
              ) &&
                add(
                  specifier.local.name,
                  getIndex(
                    packageName,
                    t.isStringLiteral(specifier.imported)
                      ? specifier.imported.value
                      : specifier.imported.name
                  )
                );
            }
          });
        });
      },

      // record fns override
      // overrided fn will be ignore
      AssignmentExpression(path) {
        const { left } = path.node;
        if (
          t.isIdentifier(left) &&
          left.name in finallyFns &&
          path.scope.hasBinding(left.name)
        ) {
          fnsOverride[left.name] = true;
        }
      },

      // add reassign callback
      VariableDeclarator(path) {
        const { init, id } = path.node;

        if (
          t.isCallExpression(init) &&
          t.isIdentifier(init.callee) &&
          init.callee.name in finallyFns &&
          !fnsOverride[init.callee.name]
        ) {
          const { callee, arguments: args } = init;
          const { name: fnName } = callee;

          const indexSubArgs = finallyFns[fnName] - args.length;

          if (indexSubArgs < 0) return;

          // fill undefined argument
          for (let i = 0; i < indexSubArgs; i++) {
            path.get("init").pushContainer(
              // @ts-ignore
              "arguments",
              t.identifier("undefined")
            );
          }

          // find all replace needed variables
          // generate reassign callback
          if (t.isIdentifier(id)) {
            const callbackTemplate = template.expression(
              `(%%VAR%%) => {${id.name}=%%VAR%%}`
            );
            path.get("init").pushContainer(
              // @ts-ignore
              "arguments",
              callbackTemplate({
                VAR: REASSIGN_FLAG + "0",
              })
            );
          }

          let count = 0;
          const alias: Array<[string, number]> = [];

          if (t.isObjectPattern(id) || t.isArrayPattern(id)) {
            const cloneIdAst = t.cloneDeepWithoutLoc(id);

            traverse(
              cloneIdAst,
              {
                Identifier(path) {
                  if (
                    t.isObjectProperty(path.parent) &&
                    path.parent.value === path.node
                  ) {
                    const newCount = count++;
                    alias.push([path.parent.value.name, newCount]);
                    path.replaceWith(t.identifier(REASSIGN_FLAG + newCount));
                    path.skip();
                  }
                  if (
                    t.isArrayPattern(path.parent) ||
                    t.isRestElement(path.parent)
                  ) {
                    const newCount = count++;
                    alias.push([path.node.name, newCount]);
                    path.replaceWith(t.identifier(REASSIGN_FLAG + newCount));
                    path.skip();
                  }
                  if (
                    t.isAssignmentPattern(path.parent) &&
                    path.parent.left === path.node
                  ) {
                    const newCount = count++;
                    alias.push([path.node.name, newCount]);
                    path.replaceWith(t.identifier(REASSIGN_FLAG + newCount));
                    path.skip();
                  }
                },
              },
              path.scope,
              undefined,
              path
            );
            const callbackTemplate = template.expression(
              `(%%VAR%%) => {%%ASSIGNS%%}`
            );

            path.get("init").pushContainer(
              // @ts-ignore
              "arguments",
              callbackTemplate({
                VAR: cloneIdAst,
                ASSIGNS: alias.map(([variable, index]) =>
                  t.expressionStatement(
                    t.assignmentExpression(
                      "=",
                      t.identifier(variable),
                      t.identifier(REASSIGN_FLAG + index)
                    )
                  )
                ),
              })
            );
          }
        }
      },
    },
  };
}
