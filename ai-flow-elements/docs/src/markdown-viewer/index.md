## 何时使用

适合表单场景。

## 示例

```tsx
import * as React from 'react';
import { MarkdownViewer } from 'ai-flow-elements';

const demo = `
# 标题
这是一段带高亮的代码：

\`\`\`ts
export const add = (a: number, b: number) => a + b;
\`\`\`

- 列表 A
- 列表 B
`;

export default function Demo() {
  return <MarkdownViewer content={demo} />;
}
```

## API

<API hideTitle  src="@/components/markdown-viewer/MarkdownViewer.tsx" />
