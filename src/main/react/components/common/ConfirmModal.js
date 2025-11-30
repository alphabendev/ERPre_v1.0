// src/main/react/components/common/ConfirmModal.js
import React from 'react';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal_overlay">
            <div className="modal_confirm">
                <div className="del_icon"><i className="bi bi-exclamation-circle"></i></div>
                {/* Use dangerouslySetInnerHTML to render HTML tags */}
                <p className='msg' dangerouslySetInnerHTML={{ __html: message }}></p>
                <div className="modal-actions">
                    <button className="box red" onClick={onConfirm}>Confirm</button>
                    <button className="box gray" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;