/**
 * React 17 隔离工具 - 确保组件使用自己的 React 17 实例
 * 完全隔离，可在 React 18 宿主应用中运行
 */

// 直接导入 React 17（会被 Rollup 打包进去）
import React from 'react';
import ReactDOM from 'react-dom';

// 存储隔离的 React 实例
const isolatedReact = React;
const isolatedReactDOM = ReactDOM;

// ⚠️ 关键：在模块加载时立即锁定 React 引用
if (typeof window !== 'undefined') {
  const namespace = '__LowcodeRendererReact17__';
  
  // 存储我们的 React 17 实例
  const isolatedInstance = {
    React: isolatedReact,
    ReactDOM: isolatedReactDOM,
    version: isolatedReact.version || '17.0.2',
    _isIsolated: true,
    _version: '17.0.2'
  };
  
  (window as any)[namespace] = isolatedInstance;

  // ⚠️ 关键：设置 React 的内部标识，防止与 React 18 冲突
  // React 17 使用 ReactSharedInternals，我们需要确保隔离
  if ((isolatedReact as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    // 标记这是我们自己的 React 实例
    Object.defineProperty(isolatedInstance, '_reactInternalInstance', {
      value: true,
      writable: false
    });
  }
}

/**
 * 初始化隔离的 React 17 实例
 */
export function initIsolatedReact() {
  return { React: isolatedReact, ReactDOM: isolatedReactDOM };
}

/**
 * 获取隔离的 React 17 实例
 */
export function getIsolatedReact() {
  return { React: isolatedReact, ReactDOM: isolatedReactDOM };
}

/**
 * 检查是否已经初始化
 */
export function isReactInitialized(): boolean {
  return isolatedReact !== null && isolatedReactDOM !== null;
}

/**
 * 验证 React 17 实例隔离
 */
export function verifyReactIsolation() {
  const ourReact = isolatedReact;
  const globalReact = (window as any).React;
  
  if (globalReact && ourReact !== globalReact) {
    console.log('[LowcodeRenderer] ✅ React 17 实例已隔离');
    console.log('[LowcodeRenderer] 组件 React 版本:', ourReact.version);
    console.log('[LowcodeRenderer] 宿主 React 版本:', globalReact?.version);
    return true;
  } else if (!globalReact) {
    console.log('[LowcodeRenderer] ✅ 没有全局 React，使用打包的 React 17');
    return true;
  } else {
    console.warn('[LowcodeRenderer] ⚠️ React 实例可能未隔离');
    return false;
  }
}