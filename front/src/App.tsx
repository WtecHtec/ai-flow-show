import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

const PerViewPage = lazy(() => import("@/views/preview"));
const EditorPage = lazy(() => import("@/views/editor"));
const LoginPage = lazy(() => import("@/views/login"));
const RegisterPage = lazy(() => import("@/views/register"));
const TemplateManagePage = lazy(() => import("@/views/template-manage"));

export default function App() {
  return (
    <main className="overflow-auto">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/templates" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/view/:id" element={<PerViewPage />} />
          <Route path="/view" element={<PerViewPage />} />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <TemplateManagePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Suspense>
    </main>
  );
}