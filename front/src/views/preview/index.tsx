import LowcodeRenderer from "@/components/LowcodeRenderer";
// import { mockProjectSchema } from "@/mock/mockSchema"
// import defaultPageSchema from "@/mock/defaultPageSchema.json";
import { getProjectSchemaFromLocalStorage } from "../editor/services/mockService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGetTempByJsonId } from "../editor/api";
import { message, Result } from "antd";
const getScenarioName = function () {
  if (location.search) {
    return (
      new URLSearchParams(location.search.slice(1)).get("scenarioName")
    );
  }
  return "";
};
const PerViewPage: React.FC = () => {
  const [projectSchema, setProjectSchema] = useState(null);
  const scenarioName = getScenarioName();
  const { id } = useParams();
  console.log("PerViewPage---", id,  scenarioName,)
  useEffect(() => {
    const handle = async (id: any) => {
       const data =  await apiGetTempByJsonId(id) as any
       if (data?.template?.schema_data) {
        setProjectSchema({ ...(data?.template?.schema_data) });
       } else {
         message.error('获取模板失败');
       }
       
    }
    if (scenarioName) {
        const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);
        setProjectSchema({ ...projectSchema });
    } else if (id) {
        handle(id)
    }
    
  }, [scenarioName, id]);

  if (!projectSchema) {
    return   <Result
    status="404"
    title="404"
    subTitle="没找到相关数据"
  />;
  }

  return <LowcodeRenderer projectSchema={projectSchema}></LowcodeRenderer>;
};

export default PerViewPage;
