import LowcodeRenderer from "@/components/LowcodeRenderer"
import { mockProjectSchema } from "@/mock/mockSchema"
const PerViewPage: React.FC = () => {

    return <LowcodeRenderer projectSchema={mockProjectSchema}></LowcodeRenderer>
}

export default PerViewPage