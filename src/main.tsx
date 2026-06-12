import { OverlayProvider } from 'overlay-kit';
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@toss/tds-mobile";
import { Global, css } from "@emotion/react";
import { makeMobileTypographyVariables, makeFixedTypographyVariables, defaultTypographyRule } from "@toss/tds-typography";
import "@toss/tds-colors/colors.css";
import App from "./App";
import "./index.css";

const globalStyles = css({
  ":root": {
    ...makeFixedTypographyVariables(),
    ...makeMobileTypographyVariables(defaultTypographyRule)
  }
});

// ThemeProvider = TDS v2.x 실질 Provider. TDS docs는 TDSMobileAITProvider 권장하나
// @toss/tds-mobile 2.4.0엔 TDSMobileProvider만 존재하며 userAgent 필수 (웹앱 불가).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <Global styles={globalStyles} />
    <OverlayProvider>
      <App />
    </OverlayProvider>
  </ThemeProvider>
);
