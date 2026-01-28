import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useAuthStore } from "./stores";
import { ToastProvider, ThemeProvider } from "./components";
import { AppRoutes } from "./routes";

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // 初始化认证状态
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
