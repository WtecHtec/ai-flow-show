// import  { types } from "recast";
// import { parse } from '@babel/parser';
// import {
//   transformFromAst as babelTransformFromAst,
//   traverse
// } from '@babel/standalone';

// import {
//     transformFromAst as babelTransformFromAst,
//     traverse,
//   } from '@babel/core'


// import { functionDeclaration, identifier, Node } from '@babel/types';

// import { transformJS } from './transform';

import * as Babel from '@babel/standalone';
import * as recast from 'recast';

const { parse: babelParse } = Babel;

function extractClassMethods(ast: any) {
  const methods: Record<string, any> = {};
  const errorsByMethods: Record<string, any> = {};

  // 1️⃣ 用 recast 解析 AST
//   const ast = recast.parse(code, {
//     parser: {
//       parse(source: string) {
//         return Babel.parse(source, {
//           sourceType: 'module',
//           plugins: ['classProperties', 'jsx', 'typescript'],
//         });
//       },
//     },
//   });

  // 2️⃣ 遍历 AST
  recast.types.visit(ast, {
    visitClassMethod(path) {
      const node = path.node;
      const name = (node.key as any).name;
      const params = node.params;
      const body = node.body;

      // 3️⃣ 构造空函数 AST
      const funcAst = recast.parse('');
      const b = recast.types.builders;

      funcAst.program.body.push(
        b.functionDeclaration(
          b.identifier(name),
          params.map((p: any) => {
            if (p.type === 'Identifier') {
              return b.identifier(p.name);
            } else {
              // 保留解构或 ...args
              return p;
            }
          }),
          body,
          node.generator,
          node.async
        )
      );

      // 4️⃣ 转成字符串
      const codeStr = recast.print(funcAst).code;

      // 5️⃣ 最终 Babel 转换
      try {
        const compiledCode = Babel.transform(codeStr, { presets: ['env'] }).code;
        methods[name] = {
          type: 'JSFunction',
          value: compiledCode,
          source: codeStr,
        };
      } catch (err: any) {
        errorsByMethods[name] = err.message;
      }

      this.traverse(path);
    },
  });

  console.log("methods, errorsByMethods", methods, errorsByMethods)
  return { methods, errorsByMethods };
}



export const defaultBabelConfig = {
    presets: [
      [
        "env",
        {
          "targets": {
            "chrome": "80"
          },
          "exclude": [
            "babel-plugin-transform-async-to-generator",
            "babel-plugin-transform-regenerator",
          ]
        }
      ],
      'react',
    ],
    sourceType: 'script',
  };
type Methods = any

/**
 * get all methods from code-editor-pane
 */
export const getMethods = (ast: any) => {
  const methods: Methods = {};
  const errorsByMethods: Record<string, string> = {};
//   recast.types.visit(ast,)
try {
    console.log('traverse(ast, {})', ast)
    return extractClassMethods(ast)
} catch (error) {
    console.log('traverse(ast, {})', ast, error)
}

//   traverse(ast, {
//     enter(path) {
//       if (!path.isClassMethod()) {
//         return;
//       }
//       let { node } = path;
//       let { name } = node.key;
//       let { params } = node;
//       let { body } = node;
//       creat empty AST
//       const code = parse('');
//       code.program.body.push(functionDeclaration(
//         identifier(name),
//         params.map((p) => {
//           if (p.type === 'Identifier') {
//             return identifier(p.name);
//           } else {
//             // 解构语法，或者 ...args
//             // 直接返回 ...args，不需要额外的构造
//             return p;
//           }
//         }),
//         body,
//         node.generator,
//         node.async
//       ));

//       const codeStr = babelTransformFromAst(code).code;
//       const { hasError, errorInfo, code: compiledCode = '' } = transformJS(codeStr, defaultBabelConfig)

//       if (hasError && errorInfo) {
//         errorsByMethods[name] = errorInfo;
//       }

//       methods[name] = {
//         type: 'JSFunction',
//         value: compiledCode,
//         source: codeStr,
//       };
//     },
//   });
  return { methods, errorsByMethods } as const;
};