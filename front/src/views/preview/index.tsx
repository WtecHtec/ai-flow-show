import LowcodeRenderer from "@/components/LowcodeRenderer";
// import { mockProjectSchema } from "@/mock/mockSchema"
// import defaultPageSchema from "@/mock/defaultPageSchema.json";
import { getProjectSchemaFromLocalStorage } from "../editor/services/mockService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGetTempByJsonId } from "../editor/api";
const getScenarioName = function () {
  if (location.search) {
    return (
      new URLSearchParams(location.search.slice(1)).get("scenarioName") ||
      "general"
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
       setProjectSchema({ ...data });
    }
    if (scenarioName) {
        const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);
        setProjectSchema({ ...projectSchema });
    } else if (id) {
        handle(id)
    }
    
  }, [scenarioName, id]);

  if (!projectSchema) {
    return <div>暂无数据</div>;
  }

  return <LowcodeRenderer projectSchema={projectSchema}></LowcodeRenderer>;
};

export default PerViewPage;
