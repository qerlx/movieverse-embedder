import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log("main.tsx executing");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  console.log("React root created");
  
  root.render(<App />);
  console.log("App component rendered");
} catch (error) {
  console.error("Error in main.tsx:", error);
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f3f4f6;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Application Failed to Load</h1>
        <p style="color: #6b7280;">Check the console for error details.</p>
      </div>
    </div>
  `;
}
