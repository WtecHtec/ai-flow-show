import { init, plugins } from "@alilc/lowcode-engine";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import InjectPlugin from "@alilc/lowcode-plugin-inject";
import ComponentPanelPlugin from "@alilc/lowcode-plugin-components-pane";
import EditorInitPlugin from "./plugins/plugin-editor-init";
import appHelper from "@/utils/appHelper";
import { createFetchHandler } from "@alilc/lowcode-datasource-fetch-handler";
import SchemaPlugin from "@alilc/lowcode-plugin-schema";
import SimulatorResizerPlugin from "@alilc/lowcode-plugin-simulator-select";
import DataSourcePanePlugin from "@alilc/lowcode-plugin-datasource-pane";
import PreviewSamplePlugin from "./plugins/plugin-preview-sample";
import DefaultSettersRegistryPlugin from "./plugins/plugin-default-setters-registry";
import SaveSamplePlugin from "./plugins/plugin-save-sample";
import CodeEditorPlugin from './plugins/plugin-code-editor'

let hasRegisterPlugins = false;
const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const tempId = searchParams.get('temp_id');

  async function registerPlugins() {
    await plugins.register(InjectPlugin);

    // 编辑
    await plugins.register(EditorInitPlugin, {
      scenarioName: "ai_flow_view",
      displayName: "AI Flow View",
      info: {},
      tempId: tempId, // 传递模板ID
    });
    // 物料
    await plugins.register(ComponentPanelPlugin);

    // 查看 schema
    await plugins.register(SchemaPlugin);

    // 尺寸视图
    await plugins.register(SimulatorResizerPlugin);

    // 数据源
    await plugins.register(DataSourcePanePlugin, {
      importPlugins: [],
      dataSourceTypes: [
        {
          type: "fetch",
        },
        {
          type: "jsonp",
        },
      ],
    });

    // 预览
    await plugins.register(PreviewSamplePlugin);

    // 设置内置 setter 和事件绑定、插件绑定面板
    await plugins.register(DefaultSettersRegistryPlugin);

    // 保存、重置
    await plugins.register(SaveSamplePlugin, {
      tempId: tempId, // 传递模板ID
    });

    await plugins.register(CodeEditorPlugin)
  }
  
  useEffect(() => {
    const handle = async () => {
      if (!hasRegisterPlugins) {
       
      }
      await registerPlugins();
      hasRegisterPlugins = true;
     

      const el = document.getElementById("lce-container") || document.body;
      init(el, {
        enableCondition: true,
        enableCanvasLock: true,

        locale: "zh-CN",

        // 默认绑定变量
        supportVariableGlobally: true,
        requestHandlersMap: {
          fetch: createFetchHandler(),
        },
        appHelper,
        enableContextMenu: true,
      });
    };

    handle();
  }, [tempId]); // 依赖 tempId

  return (
    <div
      id="lce-container"
      className="w-full relative h-screen overflow-hidden"
    ></div>
  );
};

export default EditorPage;