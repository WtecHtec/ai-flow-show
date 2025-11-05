import * as React from 'react';
import { createElement, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import 'highlight.js/styles/github.css';
import './index.scss';

export interface MarkdownViewerProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  allowHtml?: boolean;   // 是否允许原始 HTML（默认 false）
  sanitize?: boolean;    // 是否开启安全过滤（默认 true）
  components?: Components; // 自定义渲染
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = function MarkdownViewer({
  content,
  className,
  style,
  allowHtml = false,
  sanitize = true,
  components,
}) {
  const rehypePlugins = useMemo(() => {
    const arr: any[] = [];
    // 高亮
    arr.push(rehypeHighlight as any);
    // 允许原始 HTML（注意：仅在可信内容时开启）
    if (allowHtml) {
      arr.push(rehypeRaw as any);
    }
    // 安全过滤（与 allowHtml 可并用：先 raw 再 sanitize）
    if (sanitize) {
      arr.push([rehypeSanitize as any, defaultSchema] as any);
    }
    return arr;
  }, [allowHtml, sanitize]);

  return (
    <div className={className ? `markdown-body ${className}` : 'markdown-body'} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

MarkdownViewer.displayName = 'MarkdownViewer';
export default MarkdownViewer;