import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log("Starting app...");

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error rendering app:", error);
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; font-family: sans-serif;">
      <div style="text-align: center;">
        <h1>App Failed to Load</h1>
        <p>Check the console for details</p>
      </div>
    </div>
  `;
}
