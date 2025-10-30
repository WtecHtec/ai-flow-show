

export class SchemaService {
  scenarioName = 'default';

  constructor(scenarioName: string) {
    if (scenarioName) {
      this.scenarioName = scenarioName;
    }
  }

  getLSName(ns = 'projectSchema') {
    return `${this.scenarioName}:${ns}`;
  }

  // 获取项目 Schema 从 localStorage
  getProjectSchemaFromLocalStorage() {
    const localValue = window.localStorage.getItem(this.getLSName());
    if (localValue) {
      return JSON.parse(localValue);
    }
    return undefined;
  }

  // 获取包信息从 localStorage  
  getPackagesFromLocalStorage() {
    const packages = window.localStorage.getItem(this.getLSName('packages'));
    if (packages) {
      return JSON.parse(packages);
    }
    return undefined;
  }

  // 获取预览语言设置
  getPreviewLocale() {
    const key = this.getLSName('previewLocale');
    return window.localStorage.getItem(key) || 'zh-CN';
  }

  // 设置预览语言
  setPreviewLocale(locale: string) {
    const key = this.getLSName('previewLocale');
    window.localStorage.setItem(key, locale || 'zh-CN');
    window.location.reload();
  }

  // 保存项目 Schema 到 localStorage
  setProjectSchemaToLocalStorage(schema: string) {
    window.localStorage.setItem(
      this.getLSName(),
      JSON.stringify(schema)
    );
  }

  // 保存包信息到 localStorage
  setPackagesToLocalStorage(packages: string) {
    window.localStorage.setItem(
      this.getLSName('packages'),
      JSON.stringify(packages)
    );
  }

  // 从 URL 参数获取场景名
  static getScenarioNameFromUrl() {
    if (window.location.search) {
      return new URLSearchParams(window.location.search.slice(1)).get('scenarioName') || 'default';
    }
    return 'default';
  }
}
