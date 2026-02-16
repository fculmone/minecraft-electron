import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import icon from '../../assets/icon.svg';
import './App.css';
import Logs from './features/Logs';
import ServersView from './features/Java/ui/JavaServersView';
import BedrockServerView from './features/Bedrock/BedrockServerView';
import Drawer from './components/Drawer';
import Dashboard from './features/Dashboard/Dashboard';
import TitleBar from './components/TitleBar';
import ServerPropertiesPanel from './features/Java/ViewServer/ViewServer';
import ToastContainer from './components/ToastContainer';

function Hello() {
  return (
    <div>
      <div className="Hello"></div>
      <Link to="/logs">Logs</Link>
      <Link to="/java">Java Servers</Link>
      <Link to="/bedrock">Bedrock Servers</Link>
      <img src={icon} alt="icon" />
      <h1>Hello, Minecraft Server Manager!</h1>
      <div className="bg-yellow-200 w-full p-4 mb-4">
        This is a test of Tailwind CSS and DaisyUI integration.
      </div>
      <button className="btn">Hello daisyUI</button>
      <button type="button" className="btn btn-primary">
        Show Test Toast
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <ToastContainer />
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          <Drawer>
            <div className="h-full overflow-y-auto flex-1">
              <main className="container mx-auto p-4 pt-12 flex-1 h-full max-h-screen">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/java" element={<ServersView />} />
                  <Route path="/bedrock" element={<BedrockServerView />} />
                  <Route
                    path="/java/edit/:id"
                    element={<ServerPropertiesPanel />}
                  />
                </Routes>
              </main>
            </div>
          </Drawer>
        </div>
      </div>
    </Router>
  );
}
