import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useAuthStore } from "./stores";
import { ToastProvider } from "./components";
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "./routes";

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Toaster theme="light" richColors position="top-center" />
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </>
  );
};

export default App;
