
import { IPublicTypeComponentMetadata, IPublicTypeSnippet } from '@alilc/lowcode-types';

const MarkdownViewerMeta: IPublicTypeComponentMetadata = {
  "componentName": "MarkdownViewer",
  "title": "Markdown",
  "docUrl": "https://youke1.picui.cn/s1/2025/11/05/690b5f61716d9.png",
  "screenshot": "https://youke1.picui.cn/s1/2025/11/05/690b5f61716d9.png",
  "devMode": "proCode",
  "npm": {
    "package": "ai-flow-elements",
    "version": "0.0.3",
    "exportName": "MarkdownViewer",
    "main": "src/index.tsx",
    "destructuring": true,
    "subName": ""
  },
  "configure": {
    "props": [
      {
        "title": {
          "label": {
            "type": "i18n",
            "en-US": "content",
            "zh-CN": "content"
          }
        },
        "name": "content",
        "setter": {
          "componentName": "StringSetter",
          "isRequired": true,
          "initialValue": ""
        }
      },
      {
        "title": {
          "label": {
            "type": "i18n",
            "en-US": "allowHtml",
            "zh-CN": "allowHtml"
          }
        },
        "name": "allowHtml",
        "setter": {
          "componentName": "BoolSetter",
          "isRequired": false,
          "initialValue": false
        }
      },
      {
        "title": {
          "label": {
            "type": "i18n",
            "en-US": "sanitize",
            "zh-CN": "sanitize"
          }
        },
        "name": "sanitize",
        "setter": {
          "componentName": "BoolSetter",
          "isRequired": false,
          "initialValue": false
        }
      },
      {
        "title": {
          "label": {
            "type": "i18n",
            "en-US": "components",
            "zh-CN": "components"
          }
        },
        "name": "components",
        "setter": {
          "componentName": "ObjectSetter",
          "props": {
            "config": {
              "extraSetter": {
                "componentName": "MixedSetter",
                "isRequired": false,
                "props": {}
              }
            }
          },
          "isRequired": false,
          "initialValue": {}
        }
      }
    ],
    "supports": {
      "className": true,
      "style": true
    },
    "component": {}
  }
};
const snippets: IPublicTypeSnippet[] = [
  {
    "title": "MarkdownViewer",
    "screenshot": "",
    "schema": {
      "componentName": "MarkdownViewer",
      "props": {}
    }
  }
];

export default {
  ...MarkdownViewerMeta,
  snippets
};
