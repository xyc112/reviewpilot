import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './components/layout/AppHeader'
import AppSider from './components/layout/AppSider'
import Dashboard from './pages/Dashboard'
import KnowledgeGraph from './pages/KnowledgeGraph'
import LearningDiagnosis from './pages/LearningDiagnosis'
import NotesManagement from './pages/NotesManagement'
import QuizSystem from './pages/QuizSystem'
import Analytics from './pages/Analytics'

const { Content } = Layout

const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <Router>
            <Layout style={{ minHeight: '100vh' }}>
                <AppSider collapsed={collapsed} />
                <Layout>
                    <AppHeader
                        collapsed={collapsed}
                        onToggle={() => setCollapsed(!collapsed)}
                    />
                    <Content style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: '#fff',
                        borderRadius: 8,
                        overflow: 'auto'
                    }}>
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
    )
}

export default App