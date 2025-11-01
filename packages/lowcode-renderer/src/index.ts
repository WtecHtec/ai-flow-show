/**
 * LowcodeRenderer 入口文件
 * 确保所有依赖都从内部加载，不依赖外部
 */

// 首先初始化 React 隔离（必须在所有导入之前）
import { initIsolatedReact } from './utils/reactIsolation';

// 初始化隔离的 React
const isolatedReact = initIsolatedReact();

// 导出组件（使用命名导出）
export { default } from './components/LowcodeRenderer';
export { default as LowcodeRenderer } from './components/LowcodeRenderer';
export * from './components/LowcodeRenderer/types';
export { SchemaService } from './utils/schemaService';
export { default as appHelper } from './utils/appHelper';
export { defaultPackages } from './components/LowcodeRenderer/default';

// 可选：导出隔离的 React 实例供高级用户使用
export const React = isolatedReact.React;
export const ReactDOM = isolatedReact.ReactDOM;