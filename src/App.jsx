// App.jsx (shell)
import { BrowserRouter } from "react-router-dom";
import SpaceshipCursor from "@shared/components/SpaceshipCursor";
import NavBar from "@app/nav/NavBar";
import AppRoutes from "@app/routes/AppRoutes";
import SpaceChatHost from "@app/chat/SpaceChatHost";
import WarpDriveFX from "@app/routes/WarpDriveFX";


export default function App() {
  return (
    <BrowserRouter basename="/Introduction/">
      {/* Global effects across all pages */}
      <SpaceshipCursor />

      {/* Chrome */}
      <NavBar />

      {/* FX overlay that reacts to route changes */}
      <WarpDriveFX />

      {/* Page outlet */}
      <AppRoutes />

      {/* Lazy chat */}
      <SpaceChatHost />
    </BrowserRouter>
  );
}
