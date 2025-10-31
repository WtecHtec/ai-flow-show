import { parse } from '@babel/parser';



export function transformAst(code: string) {
  // TODO: 配置未来需要外化
  return parse(code, { sourceType: 'module',
plugins: [
    'asyncGenerators',
    'bigInt',
    'classPrivateMethods',
    'classPrivateProperties',
    'classProperties',
    ['decorators', { decoratorsBeforeExport: false }],
    'doExpressions',
    'dynamicImport',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'flowComments',
    'functionBind',
    'functionSent',
    'importMeta',
    'jsx',
    'logicalAssignment',
    'nullishCoalescingOperator',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'optionalChaining',
    ['pipelineOperator', { proposal: 'minimal' }],
    'throwExpressions',
  ] });
}