// src/main/react/components/common/ConfirmCustom.js
import React, { useState, useEffect, useCallback } from 'react';

const ConfirmCustom = () => {
    const [isVisible, setIsVisible] = useState(false); // State to track if the modal is visible
    const [message, setMessage] = useState(''); // State to store the message displayed in the modal
    const [resolveCallback, setResolveCallback] = useState(null); // Store the Promise's resolve function for later use
    const [modalWidth, setModalWidth] = useState(null); // State to store modal width

    // 🔴 Define confirmCustom function to show the modal and handle user choice via Promise
    // This function takes a message and optional width, displays the modal, and resolves the Promise based on user action
    const confirmCustom = useCallback((message, width = null) => {
        return new Promise((resolve) => {
            setMessage(message);    // Set the provided message in the modal
            setModalWidth(width);   // Set modal width if provided
            setIsVisible(true);     // Show the modal
            setResolveCallback(() => resolve);  // Store the Promise resolve function
        });
    }, []);

    // 🟡 Make confirmCustom globally accessible
    // Register confirmCustom to the window object so it can be called from anywhere
    useEffect(() => {
        window.confirmCustom = confirmCustom;  // Assign confirmCustom to window
    }, [confirmCustom]);

    // 🟡 Handle 'Confirm' button click
    // Closes the modal and resolves the Promise with true
    const handleConfirm = () => {
        resolveCallback(true);  // Resolve the Promise with true
        setIsVisible(false);    // Hide the modal
    };

    // 🟡 Handle 'Cancel' button click
    // Closes the modal and resolves the Promise with false
    const handleCancel = () => {
        resolveCallback(false); // Resolve the Promise with false
        setIsVisible(false);    // Hide the modal
    };

    // If modal is not visible, render nothing
    if (!isVisible) return null;

    // 🟢 Render modal when visible
    return (
        <div className="modal_overlay">
            <div className="modal_confirm" style={modalWidth ? { width: modalWidth } : {}}>
                {/* Message area with icon */}
                <div className="icon_wrap"><i className="bi bi-exclamation-circle"></i></div>
                {/* Render message as HTML. Be cautious of XSS if message contains external input */}
                <p className='msg' dangerouslySetInnerHTML={{ __html: message }}></p>
                {/* Confirm and Cancel buttons */}
                <div className="modal-actions">
                    <button className="box red" onClick={handleConfirm}>Confirm</button>
                    <button className="box gray" onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmCustom;
