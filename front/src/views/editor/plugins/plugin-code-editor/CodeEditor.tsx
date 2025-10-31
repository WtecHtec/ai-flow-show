import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';

interface CodeEditorProps {
  ctx: IPublicModelPluginContext;
  options?: any;
  defaultValue?: string;
  language?: string;
  onChange?: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  ctx,
  options = {},
  defaultValue = '',
  language = 'javascript',
  onChange,
}) => {
  const editorRef = useRef<any>(null);



  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // 注册自动补全
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: 'this.state',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'this.state',
            documentation: '组件状态',
            range,
          },
          {
            label: 'this.props',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'this.props',
            documentation: '组件属性',
            range,
          },
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '打印日志',
            range,
          },
          {
            label: 'useState',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useState Hook',
            range,
          },
          {
            label: 'useEffect',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'useEffect(() => {\n  ${1:// effect}\n  return () => {\n    ${2:// cleanup}\n  }\n}, [${3:dependencies}])',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useEffect Hook',
            range,
          },
        ];

        return { suggestions };
      },
    });
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined && onChange) {
      onChange(value);
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      value={defaultValue}
      theme={options.editorConfig?.theme || 'vs-dark'}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      options={{
        fontSize: options.editorConfig?.fontSize || 14,
        lineNumbers: options.editorConfig?.lineNumbers || 'on',
        minimap: {
          enabled: options.editorConfig?.minimap !== false,
        },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
};

export default CodeEditor;