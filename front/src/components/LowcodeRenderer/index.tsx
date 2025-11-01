import React, { useState, useEffect } from 'react';
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import { buildComponents, AssetLoader, } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { SchemaService } from '@/utils/schemaService';
import appHelper from '@/utils/appHelper';
import { RendererData, PackageInfo, LibraryMap, ComponentMapItem, ProjectSchema } from './types';
import { defaultPackages } from './default';
import assets from '@/views/editor/services/assets.json';
interface LowcodeRendererProps {
    projectSchema?: ProjectSchema;
    scenarioName?: string;
    className?: string;
}

const LowcodeRenderer: React.FC<LowcodeRendererProps> = ({
    scenarioName,
    projectSchema,
    className = 'lowcode-renderer'
}) => {
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

            const packages = [...assets.packages];
          

            if (!projectSchema) {
                console.warn('No project schema found in localStorage');
                setLoading(false);
                return;
            }

            const {
                componentsMap: componentsMapArray,
                componentsTree,
                i18n,
                dataSource: projectDataSource,
            } = projectSchema;

            // 构建组件映射
            const componentsMap: Record<string, ComponentMapItem> = {};
            componentsMapArray?.forEach((component: ComponentMapItem) => {
                componentsMap[component.componentName] = component;
            });

            const pageSchema = componentsTree?.[0];
            if (!pageSchema) {
                console.warn('No page schema found');
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

            // 设置全局语言切换函数
            if (!(window as any).setPreviewLocale) {
                (window as any).setPreviewLocale = (locale: string) => {
                    schemaService.setPreviewLocale(locale);
                };
            }

        } catch (error) {
            console.error('渲染器初始化失败:', error);
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
        return <div>Loading...</div>;
    }

    if (!schema || !components) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                <div className="text-center">
                    <p className="text-lg mb-2">未找到可渲染的 Schema</p>
                    <p className="text-sm">请检查 localStorage 中是否有有效的项目数据</p>
                </div>
            </div>
        );
    }

    const schemaService = new SchemaService(scenarioName ?? '');
    const currentLocale = schemaService.getPreviewLocale();

    return (
        <div className={className}>
            <ReactRenderer
                className="lowcode-renderer-content"
                schema={{
                    ...schema,
                    dataSource: mergeWith(schema.dataSource, projectDataSource, customizer),
                }}
                components={components}
                locale={currentLocale}
                messages={i18n}
                appHelper={appHelper}
            />
        </div>
    );
};

export default LowcodeRenderer;