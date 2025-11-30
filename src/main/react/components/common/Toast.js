// src/main/react/components/common/Toast.js
import React, { useEffect, useState, useCallback } from 'react';

let toastId = 0;

const Toast = () => {
    const [toasts, setToasts] = useState([]); // Manage multiple toasts

    // 🔴 Define showToast function with useCallback to add toasts (useCallback: remembers the showToast function and recreates it only when the toasts array changes)
    const showToast = useCallback((message, type = 'check', duration = 3000) => { // Default: display for 3 seconds

        // Check for duplicate messages
        // const isDuplicate = toasts.some(toast => toast.message === message);
        // if (isDuplicate) return; // Don't add if message already exists

        const id = toastId++;
        setToasts([...toasts, { id, message, type, duration }]);

        // Remove toast after duration
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, duration);
    }, [toasts]);

    // 🟡 Add this function to window for easy use from other places
    useEffect(() => {
        window.showToast = showToast; // Set as global function (showToast can be called from anywhere)
    }, [showToast]);

    // 🟡 Icon selection function
    const getIcon = (type) => {
        switch (type) {
            case 'error':
                return <i className="bi bi-exclamation-circle-fill"></i>; // error icon
            case 'check':
            default:
                return <i className="bi bi-check-circle-fill"></i>; // default check icon
        }
    };

    // 🟢 Render
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    {getIcon(toast.type)} {toast.message}
                </div>
            ))}
        </div>
    );
};

export default Toast;