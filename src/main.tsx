  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";
  import App from "./app/App.tsx";
  import { AuthProvider } from "./app/context/AuthContext.tsx";
  import "./styles/index.css";
  import { Toaster } from "sonner";

  createRoot(document.getElementById("root")!).render(
    <>
      <Toaster theme="dark" position="top-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </>
  );