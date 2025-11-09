import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { injectAssets } from '@alilc/lowcode-plugin-inject';
import assets from '../../services/assets.json';
import { getProjectSchema } from '../../services/mockService';
import { apiGetTemplate } from '../../api';

const EditorInitPlugin = (ctx: IPublicModelPluginContext, options: any) => {
  return {
    async init() {
      const { material, project, config } = ctx;
      const scenarioName = options['scenarioName'];
      const scenarioDisplayName = options['displayName'] || scenarioName;
      const scenarioInfo = options['info'] || {};
      const tempId = options['tempId']; // 获取模板ID
      
      // 保存在 config 中用于引擎范围其他插件使用
      config.set('scenarioName', scenarioName);
      config.set('scenarioDisplayName', scenarioDisplayName);
      config.set('scenarioInfo', scenarioInfo);
      if (tempId) {
        config.set('tempId', tempId);
      }

      // 设置物料描述
      await material.setAssets(await injectAssets(assets));

      let schema;
      if (tempId) {
        // 如果有模板ID，从API加载模板数据
        try {
          const res = await apiGetTemplate(tempId);
          if (res.template && res.template.schema_data && Object.keys(res.template.schema_data).length > 0) {
            // 如果模板有 schema_data，使用模板的 schema
            schema = res.template.schema_data;
          } else {
            // 否则使用默认 schema
            schema = await getProjectSchema(scenarioName);
          }
        } catch (error) {
          console.error('加载模板失败，使用默认 schema:', error);
          schema = await getProjectSchema(scenarioName);
        }
      } else {
        // 没有模板ID，使用默认 schema
        schema = await getProjectSchema(scenarioName);
      }
      
      // 加载 schema
      project.importSchema(schema as any);
    },
  };
}
EditorInitPlugin.pluginName = 'EditorInitPlugin';
EditorInitPlugin.meta = {
  preferenceDeclaration: {
    title: '保存插件配置',
    properties: [
      {
        key: 'scenarioName',
        type: 'string',
        description: '用于localstorage存储key',
      },
      {
        key: 'displayName',
        type: 'string',
        description: '用于显示的场景名',
      },
      {
        key: 'info',
        type: 'object',
        description: '用于扩展信息',
      },
      {
        key: 'tempId',
        type: 'string',
        description: '模板ID，如果提供则从API加载模板数据',
      }
    ],
  },
};
export default EditorInitPlugin;