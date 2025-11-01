import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建忽略 CSS 的插件（更简单的方案）
const ignoreCss = () => ({
  name: 'ignore-css',
  load(id) {
    // 将 CSS 文件转换为空模块
    if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.less')) {
      return 'export default {}';
    }
  },
  resolveId(id) {
    // 如果导入的是 CSS 文件，返回 id 让它被 load 处理
    if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.less')) {
      return id;
    }
    return null;
  }
});

export default [
  // UMD 构建 - 所有依赖都打包进去
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LowcodeRenderer',
      sourcemap: true,
    },
    plugins: [
      ignoreCss(), // 放在最前面
      resolve({
        browser: true,
        preferBuiltins: false,
        dedupe: ['react', 'react-dom'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true,
        strictRequires: false,
        ignoreGlobal: true
      }),
      json(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        jsx: 'react',
        declarationMap: false,
      })
    ],
    external: [],
    onwarn(warning, warn) {
      // 忽略 CSS 相关的警告
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.id && warning.id.endsWith('.css')) {
        return;
      }
      warn(warning);
    },
    treeshake: {
      moduleSideEffects: false
    }
  },
  // ESM 构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      ignoreCss(),
      resolve({
        browser: true,
        preferBuiltins: false,
        dedupe: ['react', 'react-dom'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true,
        strictRequires: false,
        ignoreGlobal: true
      }),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        jsx: 'react',
        declarationMap: false,
      })
    ],
    external: [],
    onwarn(warning, warn) {
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.id && warning.id.endsWith('.css')) {
        return;
      }
      warn(warning);
    },
    treeshake: {
      moduleSideEffects: false
    }
  },
  // CommonJS 构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      ignoreCss(),
      resolve({
        browser: true,
        preferBuiltins: false,
        dedupe: ['react', 'react-dom'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true,
        strictRequires: false,
        ignoreGlobal: true
      }),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        jsx: 'react',
        declarationMap: false,
      })
    ],
    external: [],
    onwarn(warning, warn) {
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.id && warning.id.endsWith('.css')) {
        return;
      }
      warn(warning);
    },
    treeshake: {
      moduleSideEffects: false
    }
  },
  // 类型定义
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()],
    external: [/\.css$/, /\.scss$/, /\.less$/]
  }
];