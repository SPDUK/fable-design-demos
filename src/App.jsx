import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage.jsx";
import { projectRoutes } from "./projects/projectRoutes.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {projectRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
