
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { Toaster } from "sonner";

  createRoot(document.getElementById("root")!).render(
    <>
      <Toaster theme="dark" position="top-right" richColors />
      <App />
    </>
  );
  