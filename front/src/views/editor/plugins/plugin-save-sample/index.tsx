import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from '@alifd/next';
import {
  saveSchema,
  resetSchema,
} from '../../services/mockService';

// 保存功能示例
const SaveSamplePlugin = (ctx: IPublicModelPluginContext, options?: any) => {
  return {
    async init() {
      const { skeleton, hotkey, config } = ctx;
      const scenarioName = config.get('scenarioName');
      const tempId = options?.tempId || config.get('tempId'); // 获取模板ID

      skeleton.add({
        name: 'saveSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: (
          <Button onClick={() => saveSchema(scenarioName, 'save', tempId)}>
            保存
          </Button>
        ),
      });
      skeleton.add({
        name: 'resetSchema',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: (
          <Button onClick={() => resetSchema(scenarioName)}>
            重置页面
          </Button>
        ),
      });

      skeleton.add({
        name: 'backToTemplateManage',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: (
          <Button onClick={() => {
             window.location.href = '/#/templates';
          }}>
            返回模板管理
          </Button>
        ),
      });
      
      hotkey.bind('command+s', (e) => {
        e.preventDefault();
        saveSchema(scenarioName, 'save', tempId);
      });
    },
  };
}
SaveSamplePlugin.pluginName = 'SaveSamplePlugin';
SaveSamplePlugin.meta = {
  dependencies: ['EditorInitPlugin'],
};
export default SaveSamplePlugin;