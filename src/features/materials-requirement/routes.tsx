
import { RouteObject } from "react-router-dom";
import MaterialsRequirementPage from "./MaterialsRequirementPage";

export const materialsRoutes: RouteObject[] = [
  {
    path: "/materials",
    element: <MaterialsRequirementPage />,
  },
];
