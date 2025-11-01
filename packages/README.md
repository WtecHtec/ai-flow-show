# @your-org/lowcode-renderer

完全独立的 Lowcode Renderer 组件（自带所有依赖，包括 React）

## 特性

- ✅ **完全独立**：自带 React 和所有依赖，不依赖外部
- ✅ **版本隔离**：使用自己的 React 实例，不会与宿主应用冲突
- ✅ **多种构建格式**：支持 UMD、ESM、CJS

## 安装

```bash
npm install @your-org/lowcode-renderer
```

## 使用方式

### 方式 1: UMD 版本（推荐，完全独立）

```html
<!DOCTYPE html>
<html>
<head>
  <title>LowcodeRenderer 测试</title>
</head>
<body>
  <div id="root"></div>
  
  <!-- 不需要引入任何外部 React，所有依赖都在组件内部 -->
  <script src="./dist/index.umd.js"></script>
  
  <script>
    const { LowcodeRenderer, React, ReactDOM } = window.LowcodeRenderer;
    
    const testSchema = {
      componentsMap: [],
      componentsTree: [{
        componentName: 'div',
        props: {
          style: { padding: '20px' },
          children: 'Hello from isolated React!'
        }
      }]
    };
    
    ReactDOM.render(
      React.createElement(LowcodeRenderer, {
        projectSchema: testSchema
      }),
      document.getElementById('root')
    );
  </script>
</body>
</html>
```

### 方式 2: ESM 版本

```tsx
import LowcodeRenderer from '@your-org/lowcode-renderer';

function App() {
  const schema = {
    componentsMap: [],
    componentsTree: [/* ... */]
  };

  return <LowcodeRenderer projectSchema={schema} />;
}
```

### 方式 3: CommonJS 版本

```javascript
const { LowcodeRenderer } = require('@your-org/lowcode-renderer');
```

## Props

- `projectSchema`: 项目 Schema 对象（必填或从 localStorage 自动获取）
- `scenarioName`: 场景名称（可选）
- `className`: 自定义类名（可选）
- `packages`: 额外的 packages（可选）
- `assets`: 额外的 assets（可选）

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 监听模式
npm run build:watch
```

## 注意事项

1. 组件使用自己的 React 实例，不会与宿主应用的 React 冲突
2. 所有依赖都打包在组件内，包体积较大
3. UMD 版本可以直接在 HTML 中使用，无需任何外部依赖