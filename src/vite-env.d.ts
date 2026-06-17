/// <reference types="vite/client" />
declare module 'html2canvas-pro' {
  const html2canvas: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}

interface ImportMetaEnv {
  readonly VITE_UX_TEST_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
