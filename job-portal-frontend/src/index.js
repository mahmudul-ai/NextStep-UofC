// Import React core libraries
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import main app component and styles
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap for styling
import './index.css'; // Custom global styles

// Create root and render the app inside the div with id="root" in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* App component contains all routes and layout */}
  </React.StrictMode>
);
