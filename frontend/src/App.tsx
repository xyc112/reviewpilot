import React, { useState } from "react";
import { Global, css } from "@emotion/react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import AppHeader from "./components/AppHeader.tsx";
import AppSider from "./components/AppSider.tsx";
import Dashboard from "./pages/Dashboard";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import LearningDiagnosis from "./pages/LearningDiagnosis";
import NotesManagement from "./pages/NotesManagement";
import QuizSystem from "./pages/QuizSystem";
import Analytics from "./pages/Analytics";

const { Content } = Layout;

const GlobalStyles: React.FC = () => {
    return (
        <Global
            styles={css`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* 自定义滚动条 */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}
        />
    );
};

const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <ConfigProvider locale={zhCN}>
            <GlobalStyles />
            <Router>
                <Layout style={{ minHeight: "100vh" }}>
                    <AppSider collapsed={collapsed} />
                    <Layout>
                        <AppHeader
                            collapsed={collapsed}
                            onToggle={() => setCollapsed(!collapsed)}
                        />
                        <Content
                            style={{
                                margin: "24px 16px",
                                padding: 24,
                                background: "#fff",
                                borderRadius: 8,
                                overflow: "auto",
                            }}
                        >
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
                                <Route path="/diagnosis" element={<LearningDiagnosis />} />
                                <Route path="/notes" element={<NotesManagement />} />
                                <Route path="/quiz" element={<QuizSystem />} />
                                <Route path="/analytics" element={<Analytics />} />
                            </Routes>
                        </Content>
                    </Layout>
                </Layout>
            </Router>
        </ConfigProvider>
    );
};

export default App;