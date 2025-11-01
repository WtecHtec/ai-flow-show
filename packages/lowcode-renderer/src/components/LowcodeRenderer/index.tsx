// ⚠️ 重要：使用隔离的 React，不依赖外部 React
import { getIsolatedReact } from '../../utils/reactIsolation';

// 初始化并获取隔离的 React
const { React, ReactDOM } = getIsolatedReact();
const { useState, useEffect } = React;

import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import { buildComponents, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { SchemaService } from '../../utils/schemaService';
import appHelper from '../../utils/appHelper';
import { RendererData, PackageInfo, LibraryMap, ComponentMapItem, ProjectSchema } from './types';
import { defaultPackages } from './default';

export interface LowcodeRendererProps {
    projectSchema?: ProjectSchema;
    scenarioName?: string;
    className?: string;
    packages?: PackageInfo[];
    assets?: {
        packages?: PackageInfo[];
    };
}

const LowcodeRenderer: React.FC<LowcodeRendererProps> = ({
    scenarioName,
    projectSchema,
    className = 'lowcode-renderer',
    packages: externalPackages,
    assets: externalAssets
}) => {
    // 使用隔离的 React Hooks
    const [data, setData] = useState<RendererData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        init();
    }, [scenarioName]);

    const init = async (): Promise<void> => {
        try {
            setLoading(true);
            const currentScenarioName = scenarioName || SchemaService.getScenarioNameFromUrl();
            const schemaService = new SchemaService(currentScenarioName);

            // 合并 packages
            const packages = [
                ...defaultPackages,
                ...(externalPackages || []),
                ...(externalAssets?.packages || [])
            ];

            // 如果没有提供 projectSchema，尝试从 localStorage 获取
            let finalProjectSchema = projectSchema;
            if (!finalProjectSchema) {
                const schemaFromLS = schemaService.getProjectSchemaFromLocalStorage();
                if (!schemaFromLS) {
                    console.warn('[LowcodeRenderer] No project schema found');
                    setLoading(false);
                    return;
                }
                finalProjectSchema = schemaFromLS;
            }

            //@ts-nocheck
            //@ts-ignore
            const {
                componentsMap: componentsMapArray,
                componentsTree,
                i18n,
                dataSource: projectDataSource,
            } = finalProjectSchema as any; 

            // 构建组件映射
            const componentsMap: Record<string, ComponentMapItem> = {};
            componentsMapArray?.forEach((component: ComponentMapItem) => {
                componentsMap[component.componentName] = component;
            });

            const pageSchema = componentsTree?.[0];
            if (!pageSchema) {
                console.warn('[LowcodeRenderer] No page schema found');
                setLoading(false);
                return;
            }

            // 构建库映射和资源
            const libraryMap: LibraryMap = {};
            const libraryAsset: string[][] = [];

            packages.forEach((pkg: PackageInfo) => {
                const { package: packageName, library, urls, renderUrls } = pkg;
                libraryMap[packageName] = library;
                if (renderUrls) {
                    libraryAsset.push(renderUrls);
                } else if (urls) {
                    libraryAsset.push(urls);
                }
            });

            // 加载资源
            if (libraryAsset.length > 0) {
                const assetLoader = new AssetLoader();
                await assetLoader.load(libraryAsset);
            }
            
            // @ts-ignore
            const components = buildComponents(libraryMap, componentsMap);

            setData({
                schema: pageSchema,
                components,
                i18n,
                projectDataSource,
            });

            // 设置全局语言切换函数（使用命名空间避免冲突）
            const namespace = '__LowcodeRendererInternal__';
            if (!((window as any)[namespace]?.setPreviewLocale)) {
                (window as any)[namespace] = (window as any)[namespace] || {};
                (window as any)[namespace].setPreviewLocale = (locale: string) => {
                    schemaService.setPreviewLocale(locale);
                };
            }

        } catch (error) {
            console.error('[LowcodeRenderer] 渲染器初始化失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const customizer = (objValue: any[], srcValue: any[]): any[] | undefined => {
        if (isArray(objValue)) {
            return objValue.concat(srcValue || []);
        }
        return undefined;
    };

    const { schema, components, i18n = {}, projectDataSource = {} } = data;

    if (loading) {
        return React.createElement('div', null, 'Loading...');
    }

    if (!schema || !components) {
        return React.createElement(
            'div',
            { className: 'lowcode-renderer-error flex items-center justify-center min-h-screen text-gray-500' },
            React.createElement(
                'div',
                { className: 'text-center' },
                React.createElement('p', { className: 'text-lg mb-2' }, '未找到可渲染的 Schema'),
                React.createElement('p', { className: 'text-sm' }, '请检查是否提供了有效的项目数据')
            )
        );
    }

    const schemaService = new SchemaService(scenarioName ?? '');
    const currentLocale = schemaService.getPreviewLocale();

    // 使用 React.createElement 确保使用隔离的 React 实例
    return React.createElement(
        'div',
        { className },
        React.createElement(ReactRenderer, {
            className: 'lowcode-renderer-content',
            schema: {
                ...schema,
                dataSource: mergeWith(schema.dataSource, projectDataSource, customizer),
            },
            components,
            locale: currentLocale,
            messages: i18n,
            appHelper,
        })
    );
};

export default LowcodeRenderer;