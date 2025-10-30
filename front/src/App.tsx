import PerViewPage from "@/views/preview";
import EditorPage from "./views/editor";


export default function App() {

  return (
    <main className="overflow-auto">
      <EditorPage ></EditorPage>
      {/* <PerViewPage ></PerViewPage> */}
    </main>
  );
}
