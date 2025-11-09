import { material, project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { Message, Dialog } from '@alifd/next';
import { IPublicTypeProjectSchema, IPublicEnumTransformStage } from '@alilc/lowcode-types';
import DefaultPageSchema from './defaultPageSchema.json';
import DefaultI18nSchema from './defaultI18nSchema.json';
import { apiSaveTemp, apiUpdateTemplate } from '../api';

const generateProjectSchema = (pageSchema: any, i18nSchema: any): IPublicTypeProjectSchema => {
  return {
    componentsTree: [pageSchema],
    componentsMap: material.componentsMap as any,
    version: '1.0.0',
    i18n: i18nSchema,
  };
}


// 保存 schema，支持模板ID
export const saveSchema = async (
  scenarioName: string = 'unknown', 
  type: "save" | "perview" = 'perview',
  tempId?: string // 可选的模板ID
) => {
  setProjectSchemaToLocalStorage(scenarioName);
  await setPackagesToLocalStorage(scenarioName);
  
  if (type === 'save') {
    const schema = project.exportSchema(IPublicEnumTransformStage.Save);
    
    if (tempId) {
      // 如果有模板ID，更新模板
      try {
        await apiUpdateTemplate(tempId, {
          schema_data: schema
        });
        Message.success('模板更新成功');
      } catch (error: any) {
        Message.error(error.response?.data?.error || '模板更新失败');
        throw error;
      }
    } else {
      // 没有模板ID，使用旧的保存方式
      await apiSaveTemp(schema);
      Message.success('成功保存');
    }
  }
};

export const resetSchema = async (scenarioName: string = 'unknown') => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: '确定要重置吗？您所有的修改都将消失！',
        onOk: () => {
          resolve();
        },
        onCancel: () => {
          reject()
        },
      })
    })
  } catch(err) {
    return;
  }
  const defaultSchema = generateProjectSchema(DefaultPageSchema, DefaultI18nSchema);

  project.importSchema(defaultSchema as any);
  project.simulatorHost?.rerender();

  setProjectSchemaToLocalStorage(scenarioName);
  await setPackagesToLocalStorage(scenarioName);
  Message.success('成功重置页面');
}

const getLSName = (scenarioName: string, ns: string = 'projectSchema') => `${scenarioName}:${ns}`;

export const getProjectSchemaFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  const localValue = window.localStorage.getItem(getLSName(scenarioName));
  if (localValue) {
    return JSON.parse(localValue);
  }
  return undefined;
}

const setProjectSchemaToLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  window.localStorage.setItem(
    getLSName(scenarioName),
    JSON.stringify(project.exportSchema(IPublicEnumTransformStage.Save))
  );
}

const setPackagesToLocalStorage = async (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  const packages = await filterPackages(material.getAssets()?.packages);
  window.localStorage.setItem(
    getLSName(scenarioName, 'packages'),
    JSON.stringify(packages),
  );
}

export const getPackagesFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName, 'packages')) || '{}');
}

export const getProjectSchema = async (scenarioName: string = 'unknown') : Promise<IPublicTypeProjectSchema> => {
  const pageSchema = await getPageSchema(scenarioName);
  return generateProjectSchema(pageSchema, DefaultI18nSchema);
};

export const getPageSchema = async (scenarioName: string = 'unknown') => {
  const pageSchema = getProjectSchemaFromLocalStorage(scenarioName)?.componentsTree?.[0];
  if (pageSchema) {
    return pageSchema;
  }

  return DefaultPageSchema;
};

export const getPreviewLocale = (scenarioName: string) => {
  const key = getLSName(scenarioName, 'previewLocale');
  return window.localStorage.getItem(key) || 'zh-CN';
}

export const setPreviewLocale = (scenarioName: string, locale: string) => {
  const key = getLSName(scenarioName, 'previewLocale');
  window.localStorage.setItem(key, locale || 'zh-CN');
  window.location.reload();
}
