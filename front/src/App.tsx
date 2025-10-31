// import PerViewPage from "@/views/preview";
// import EditorPage from "./views/editor";
import { lazy, Suspense } from "react";

import { Routes, Route, Navigate } from "react-router-dom";

const PerViewPage = lazy(() => import("@/views/preview"));
const EditorPage = lazy(() => import("@/views/editor"));

export default function App() {

  return (
    <main className="overflow-auto">
      {/* <EditorPage ></EditorPage> */}
      {/* <PerViewPage ></PerViewPage> */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/editor" replace />} />
          <Route path="/editor" element={<EditorPage />} />
          {/* <Route path="/preview" element={<PerViewPage />} /> */}
          <Route path="/view/:id?" element={<PerViewPage />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Suspense>
    </main>
  );
}
