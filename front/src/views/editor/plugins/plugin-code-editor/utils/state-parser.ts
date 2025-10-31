import * as Babel from '@babel/standalone';
import * as recast from 'recast';
// import { transformJS } from './transform';
import { defaultBabelConfig } from './get-methods';



export const stateParser = (ast: any) => {
  const state: Record<string, any> = {};

  // const ast = recast.parse(code, {
  //   parser: {
  //     parse(source: string) {
  //       return babelParse(source, {
  //         sourceType: 'module',
  //         plugins: ['classProperties', 'jsx', 'typescript'],
  //       });
  //     },
  //   },
  // });
  console.log("ast", ast)

  const b = recast.types.builders;

  recast.types.visit(ast, {
    // 找到对象表达式
    visitObjectExpression(path) {
     
      const parent = path.parentPath.node;

      // 判断是否是 state 赋值
      let isState = false;
     
      if (
        parent.type === 'ClassProperty' &&
        parent.key.type === 'Identifier' &&
        parent.key.name === 'state'
      ) {
        isState = true;
      } else if (
        parent.type === 'AssignmentExpression' &&
        parent.left.type === 'MemberExpression' &&
        parent.left.property.type === 'Identifier' &&
        parent.left.property.name === 'state'
      ) {
        isState = true;
      }
      console.log(path, parent, isState)
      if (isState) {
        path.node.properties.forEach((property: any) => {
          // 取 key 名称
          const keyName =
            property.key.type === 'Identifier'
              ? property.key.name
              : property.key.value;

          if (!keyName) return;

          // 构建空 AST + var name = property.value
          const codeAst = b.program([
            b.variableDeclaration('var', [
              b.variableDeclarator(b.identifier('name'), property.value),
            ]),
          ]);

          const codeStr = recast.print(codeAst).code;

          const compiledCode = Babel.transform(codeStr, defaultBabelConfig)?.code || '';

          state[keyName] = {
            type: 'JSExpression',
            value: compiledCode.replace('var name = ', '').replace(/;$/, ''),
          };
        });
      }

      this.traverse(path);
    },
  });

  return state;
};