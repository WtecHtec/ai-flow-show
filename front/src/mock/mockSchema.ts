

// 从 demo-general 的真实 schema 简化的测试版本
export const mockProjectSchema = {
    componentsMap: [
      {
        componentName: 'Page',
        package: '@alilc/lowcode-materials',
        destructuring: true,
        exportName: 'Page'
      },
      {
        componentName: 'Button',
        package: '@alifd/next',
        destructuring: true,
        exportName: 'Button'
      },
      {
        componentName: 'NextText',
        package: '@alilc/lowcode-materials',
        destructuring: true,
        exportName: 'NextText'
      },
      {
        componentName: 'NextP',
        package: '@alilc/lowcode-materials',
        destructuring: true,
        exportName: 'NextP'
      },
      {
        componentName: 'NextBlockCell',
        package: '@alilc/lowcode-materials',
        destructuring: true,
        exportName: 'NextBlockCell'
      },
      {
        componentName: 'NextBlock',
        package: '@alilc/lowcode-materials',
        destructuring: true,
        exportName: 'NextBlock'
      }
    ],
    componentsTree: [
      {
        componentName: 'Page',
        id: 'node_test_page',
        props: {
          ref: 'outerView',
          style: {
            height: '100%'
          }
        },
        dataSource: {
          list: [
            {
              type: 'fetch',
              isInit: true,
              options: {
                params: {},
                method: 'GET',
                isCors: true,
                timeout: 5000,
                headers: {},
                uri: 'mock/info.json'
              },
              id: 'info'
            }
          ]
        },
        state: {
          text: {
            type: 'JSExpression',
            value: '"Lowcode 渲染器测试"'
          },
          info: {
            type: 'JSExpression',
            value: '{info: "Hello AliLowCode!!"}'
          }
        },
        methods: {
          testFunc: {
            type: 'JSFunction',
            value: 'function testFunc() {\n  console.log("测试函数被调用");\n}'
          }
        },
        children: [
          {
            componentName: 'NextBlock',
            id: 'node_test_block',
            props: {
              title: '测试区域',
              noPadding: false,
              noBorder: false,
              background: 'surface',
              style: {
                padding: '20px',
                margin: '20px'
              }
            },
            children: [
              {
                componentName: 'NextBlockCell',
                id: 'node_test_cell',
                props: {
                  title: '测试内容',
                  mode: 'procard'
                },
                children: [
                  {
                    componentName: 'NextP',
                    id: 'node_test_p',
                    props: {
                      wrap: false,
                      type: 'body2',
                      align: 'left',
                      style: {
                        marginBottom: '16px'
                      }
                    },
                    children: [
                      {
                        componentName: 'NextText',
                        id: 'node_test_text',
                        props: {
                          type: 'h3',
                          children: {
                            type: 'JSExpression',
                            value: 'this.state.info?.info || "Hello AliLowCode!!"',
                            mock: 'Hello AliLowCode!!'
                          }
                        }
                      }
                    ]
                  },
                  {
                    componentName: 'Button',
                    id: 'node_test_button',
                    props: {
                      type: 'primary',
                      size: 'medium',
                      children: '测试按钮',
                      onClick: {
                        type: 'JSFunction',
                        value: 'function() {\n  console.log("按钮被点击了!");\n  this.testFunc();\n}'
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    i18n: {
      'zh-CN': {
        'test.title': '测试标题',
        'test.content': '测试内容'
      },
      'en-US': {
        'test.title': 'Test Title',
        'test.content': 'Test Content'
      }
    },
    dataSource: {},
    version: '1.0.0'
  };
  
  // 基于 demo-general assets.json 的包配置

  