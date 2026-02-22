// App.jsx (shell)
import { BrowserRouter } from "react-router-dom";
import NavBar from "@app/nav/NavBar";
import AppRoutes from "@app/routes/AppRoutes";
import WarpDriveFX from "@app/routes/WarpDriveFX";
import ScrollToTop from "@app/routes/ScrollToTop";


export default function App() {
  return (
    <BrowserRouter basename="/">
      <ScrollToTop />

      {/* Chrome */}
      <NavBar />

      {/* FX overlay that reacts to route changes */}
      <WarpDriveFX />

      {/* Page outlet */}
      <AppRoutes />
    </BrowserRouter>
  );
}
