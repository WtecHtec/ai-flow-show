import LowcodeRenderer from "@/components/LowcodeRenderer";
// import { mockProjectSchema } from "@/mock/mockSchema"
import defaultPageSchema from "@/mock/defaultPageSchema.json";
import { getProjectSchemaFromLocalStorage } from "../editor/services/mockService";
import { useEffect, useState } from "react";
const getScenarioName = function () {
  if (location.search) {
    return (
      new URLSearchParams(location.search.slice(1)).get("scenarioName") ||
      "general"
    );
  }
  return "general";
};
const PerViewPage: React.FC = () => {
  const [projectSchema, setProjectSchema] = useState(null);
  const scenarioName = getScenarioName();
  useEffect(() => {
    const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);
    setProjectSchema({ ...projectSchema });
  }, [scenarioName]);

  if (!projectSchema) {
    return <div>暂无数据</div>;
  }

  return <LowcodeRenderer projectSchema={projectSchema}></LowcodeRenderer>;
};

export default PerViewPage;
