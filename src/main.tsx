import React from "react";
import { OverlayProvider } from 'overlay-kit';
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@toss/tds-mobile";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <OverlayProvider>
      <App />
    </OverlayProvider>
  </ThemeProvider>
);
