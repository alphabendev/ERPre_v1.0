import React, {useState} from 'react';
import ReactDOM from 'react-dom/client'; // Use ReactDOM to render React components to the DOM
import {BrowserRouter, Routes, Route} from "react-router-dom"; // React routing library
import Layout from "../../layout/Layout"; // Import common layout component (header, footer, etc.)
import '../../../resources/static/css/hr/EmployeeRegister.css'; // Apply individual CSS styles

// Component
function EmployeeRegister() {
    return (
        <Layout currentMenu="employeeRegister"> {/* Layout component, currentMenu indicates the currently selected menu */}
            <div className="top-container">
                <h2>Employee Registration</h2>
            </div>
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')); // Render React component to the root DOM element
root.render(
    <BrowserRouter> {/* Use React Router to support client-side routing */}
        <EmployeeRegister/> {/* Render component */}
    </BrowserRouter>
);