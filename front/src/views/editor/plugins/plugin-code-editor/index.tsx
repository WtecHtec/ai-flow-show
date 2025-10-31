import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import CodeEditor from './CodeEditor';
import { CodeEditorPane } from './CodeEditorPane';
import icon from './icon';
export interface ICodeEditorPluginOptions {
  // 编辑器配置
  editorConfig?: {
    theme?: 'vs-dark' | 'vs-light';
    fontSize?: number;
    lineNumbers?: 'on' | 'off';
    minimap?: boolean;
  };
  // 支持的语言
  supportedLanguages?: string[];
  // 自定义面板位置
  panelPosition?: 'left' | 'right' | 'bottom';
}

const CodeEditorPlugin = (ctx: IPublicModelPluginContext, options: ICodeEditorPluginOptions = {}) => {
  return {
    width: 600,
    async init() {
      const { skeleton, config, project, material } = ctx;

      // 注册代码编辑器组件
      skeleton.add({
        area: 'leftArea',
        name: 'codeEditorPane',
        type: 'PanelDock',
        content: CodeEditorPane,
        contentProps: {
          ctx,
          options,
        },
        panelProps: {
            width: '500px',
            title: '代码编辑器',
          },
        props: {
            icon,
          description: '代码编辑器',
          align: 'bottom',
          width: 500
        },
      });

      // 注册右键菜单
      skeleton.add({
        area: 'leftArea',
        name: 'codeEditorMenu',
        type: 'Widget',
        props: {
          align: 'bottom',
        },
        content: CodeEditor,
        contentProps: {
          ctx,
          options,
        },
      });

      // 监听选中节点变化
      project.currentDocument?.selection.onSelectionChange(() => {
        // 更新代码编辑器内容
        console.log('Selection changed');
      });

      console.log('CodeEditorPlugin initialized');
    },
 
  };
};

CodeEditorPlugin.pluginName = 'CodeEditorPlugin';
CodeEditorPlugin.meta = {
  preferenceDeclaration: {
    title: '代码编辑器插件配置',
    properties: [
      {
        key: 'theme',
        type: 'string',
        description: '编辑器主题',
        default: 'vs-dark',
      },
    ],
  },
};


export default CodeEditorPlugin;
