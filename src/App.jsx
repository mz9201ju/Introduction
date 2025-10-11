// App.jsx (shell)
import { BrowserRouter } from "react-router-dom";
import SpaceshipCursor from "@shared/components/SpaceshipCursor";
import NavBar from "../src/app/nav/NavBar";
import AppRoutes from "../src/app/routes/AppRoutes";
import SpaceChatHost from "../src/app/chat/SpaceChatHost";

export default function App() {
  return (
    <BrowserRouter basename="/Introduction/">
      {/* Global effects across all pages */}
      <SpaceshipCursor />

      {/* Chrome */}
      <NavBar />

      {/* Page outlet */}
      <AppRoutes />

      {/* Lazy chat */}
      <SpaceChatHost />
    </BrowserRouter>
  );
}
