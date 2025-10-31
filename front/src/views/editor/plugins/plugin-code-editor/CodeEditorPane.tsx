import React, { useState, useEffect, useRef } from "react";
import { IPublicModelPluginContext } from "@alilc/lowcode-types";
import CodeEditor from "./CodeEditor";
import { common, project } from "@alilc/lowcode-engine";
import { schema2CssCode, schema2JsCode } from "./utils/schema-to-code";
import { transformAst } from "./utils/ast";
import { getMethods } from "./utils/get-methods";

export const CodeEditorPane: React.FC<{
  ctx: IPublicModelPluginContext;
  options: any;
}> = ({ ctx, options }) => {
  const [jsCode, setJsCode] = useState("");
  const [cssCode, setCssCode] = useState("");

  const [codeType, setCodeType] = useState<"jsx" | "css">("jsx");
  const lowcodeProjectRef = useRef(project);
  const [schema, setSchema] = useState(() =>
    project.exportSchema(common.designerCabin.TransformStage.Save)
  );
  const saveSchemaRef = useRef<() => void>(); // save code to schema

  const getSchemaFromCode = (code: any) => {
    const ast = transformAst(code);
    console.log("methods,", ast)
    // const { methods, errorsByMethods } = getMethods(ast);
    // console.log("methods, errorsByMethods", methods, errorsByMethods)
    return {};
  };
  useEffect(() => {
    //@ts-ignore
    saveSchemaRef.current = (jsCode, cssCode) => {
      try {
        const currentSchema = lowcodeProjectRef.current?.exportSchema(
          common.designerCabin.TransformStage.Save
        );
        const pageNode = currentSchema.componentsTree[0];
        // @ts-ignore
        // @ts-nocheck
        const {
          state,
          methods,
          lifeCycles,
          originCode = "",
        } = (getSchemaFromCode(jsCode) ?? {}) as any;
        const css = cssCode;
        pageNode.state = state;
        pageNode.methods = methods;
        pageNode.lifeCycles = lifeCycles;
        //@ts-ignore
        pageNode.originCode = originCode;

        pageNode.css = css;
        // lowcodeProjectRef.current?.importSchema(currentSchema);

        // setSchema(currentSchema);
      } catch (err) {}
    };

    return () => {
      // 清理监听器
    };
  }, [ctx]);

  const handleCodeChange = (newCode: string) => {
    setJsCode(newCode);
  };

  useEffect(() => {
    if (codeType === "jsx") {
      setJsCode(schema2JsCode(schema));
      getSchemaFromCode(schema2JsCode(schema))
    } else if (codeType === "css") {
      setCssCode(schema2CssCode(schema));
    }
  }, [codeType, schema]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #333",
          background: "#1e1e1e",
        }}
      >
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={() => setCodeType("jsx")}
            style={{
              padding: "5px 15px",
              background: codeType === "jsx" ? "#007acc" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: "3px",
            }}
          >
            JSX
          </button>
          <button
            onClick={() => setCodeType("css")}
            style={{
              padding: "5px 15px",
              background: codeType === "css" ? "#007acc" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: "3px",
            }}
          >
            CSS
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {codeType === "jsx" ? (
          <CodeEditor
            ctx={ctx}
            options={options}
            defaultValue={jsCode}
            language={codeType === "jsx" ? "javascript" : codeType}
            onChange={handleCodeChange}
          />
        ) : (
          <CodeEditor
            ctx={ctx}
            options={options}
            defaultValue={cssCode}
            language={codeType}
            onChange={handleCodeChange}
          />
        )}
      </div>
    </div>
  );
};
