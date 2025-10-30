export interface PackageInfo {
    package: string;
    library: string;
    urls?: string[];
    renderUrls?: string[];
  }
  
  export interface ComponentMapItem {
    componentName: string;
    package?: string;
    [key: string]: any;
  }
  
  export interface ProjectSchema {
    componentsMap: ComponentMapItem[];
    componentsTree: any[];
    i18n?: Record<string, any>;
    dataSource?: Record<string, any>;
    version?: string;
  }
  
  export interface RendererData {
    schema?: any;
    components?: Record<string, any>;
    i18n?: Record<string, any>;
    projectDataSource?: Record<string, any>;
  }
  
  export interface LibraryMap {
    [packageName: string]: string;
  }