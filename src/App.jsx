// App.jsx (shell)
import { HashRouter } from "react-router-dom";
import NavBar from "@app/nav/NavBar";
import AppRoutes from "@app/routes/AppRoutes";
import WarpDriveFX from "@app/routes/WarpDriveFX";


export default function App() {
  return (
    <HashRouter>
      {/* Chrome */}
      <NavBar />

      {/* FX overlay that reacts to route changes */}
      <WarpDriveFX />

      {/* Page outlet */}
      <AppRoutes />
    </HashRouter>
  );
}
