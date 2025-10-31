import LowcodeRenderer from "@/components/LowcodeRenderer"
// import { mockProjectSchema } from "@/mock/mockSchema"
import defaultPageSchema from "@/mock/defaultPageSchema.json"
const PerViewPage: React.FC = () => {

    return <LowcodeRenderer projectSchema={defaultPageSchema}></LowcodeRenderer>
}

export default PerViewPage