import { init, plugins } from "@alilc/lowcode-engine";
import { useEffect, useLayoutEffect } from "react"
import InjectPlugin from '@alilc/lowcode-plugin-inject';
import ComponentPanelPlugin from '@alilc/lowcode-plugin-components-pane';
import EditorInitPlugin from "./plugins/plugin-editor-init";
import appHelper from "@/utils/appHelper";
import { createFetchHandler } from "@alilc/lowcode-datasource-fetch-handler";
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import SimulatorResizerPlugin from '@alilc/lowcode-plugin-simulator-select';

const EditorPage = () => {

    async function registerPlugins() {
        await plugins.register(InjectPlugin);

        await plugins.register(EditorInitPlugin, {
            scenarioName: 'ai_flow_view',
            displayName: 'AI Flow View',
            info: {
            },
        });
        await plugins.register(ComponentPanelPlugin);

        await plugins.register(SchemaPlugin)

        await plugins.register(SimulatorResizerPlugin)
    }
    useEffect(() => {
        const handle = async () => {
            await registerPlugins();

            const el = document.getElementById('lce-container') || document.body
            init(el, {
                enableCondition: true,
                enableCanvasLock: true,
      
                locale: 'zh-CN',
      
                // 默认绑定变量
                supportVariableGlobally: true,
                requestHandlersMap: {
                  fetch: createFetchHandler(),
                },
                appHelper,
                enableContextMenu: true,
            });
          
        }

        handle()

    }, [])
    return (
        <div id="lce-container" className="w-full h-screen"></div>
    )
}

export default EditorPage