import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css'; // Common CSS file
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/customer/CustomerList.css';
import axios from 'axios';

// Date formatting function
const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Customer registration modal
function CustomerRegisterModal({ show, onClose, onSave, customerData }) {
    const [form, setForm] = useState({
        customerName: '',                    // Customer name
        customerTel: '',                     // Customer contact
        customerRepresentativeName: '',      // Representative name
        customerBusinessRegNo: '',           // Business registration number
        customerAddr: '',                    // Business address
        customerFaxNo: '',                   // Fax number
        customerManagerName: '',             // Manager name
        customerManagerEmail: '',            // Manager email
        customerManagerTel: '',              // Manager contact
        customerCountryCode: '',             // Country code
        customerType: '',                    // Customer classification
        customerEtaxInvoiceYn: '',           // E-tax invoice availability
        customerTransactionStartDate: '',    // Transaction start date
        customerTransactionEndDate: ''       // Transaction end date
    });

    // Prevent confirmation modal from appearing twice
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Error message state
    const [errors, setErrors] = useState({
        customerName: '',
        customerBusinessRegNo: '',
        customerTel: '',
        customerManagerTel: '',
        customerManagerEmail: ''
    });

    // Reset form every time modal opens
    useEffect(() => {
        if (show) {
            if (customerData) {
                setForm(customerData); // Apply existing customer data to form
            } else {
                // Reset form for new customer registration
                setForm({
                    customerName: '',
                    customerTel: '',
                    customerRepresentativeName: '',
                    customerBusinessRegNo: '',
                    customerAddr: '',
                    customerFaxNo: '',
                    customerManagerName: '',
                    customerManagerEmail: '',
                    customerManagerTel: '',
                    customerCountryCode: '',
                    customerType: '',
                    customerEtaxInvoiceYn: '',
                    customerTransactionStartDate: '',
                    customerTransactionEndDate: ''
                });
            }
            // Reset error messages
            setErrors({
                customerName: '',
                customerBusinessRegNo: '',
                customerTel: '',
                customerManagerTel: '',
                customerManagerEmail: ''
            });
        }
    }, [show, customerData]);

    // Update form state when input values change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Form submission handling
    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Required field validation
        let valid = true;
        let newErrors = {
            customerName: '',
            customerBusinessRegNo: '',
            customerTel: '',
            customerManagerTel: '',
            customerManagerEmail: '',
        };

        if (!form.customerName.trim()) {
            newErrors.customerName = 'Customer name is a required field.';
            valid = false;
        }
        if (!form.customerBusinessRegNo.trim()) {
            newErrors.customerBusinessRegNo = 'Business registration number is a required field.';
            valid = false;
        }
        // Update error state
        setErrors(newErrors);

        // Stop saving if required field validation fails
        if (!valid) {
            return;
        }

        // 2. Duplicate check
        axios
            .post('/api/customer/checkDuplicate', {
                customerName: form.customerName,
                customerBusinessRegNo: form.customerBusinessRegNo,
            })
            .then((response) => {
                if (response.data.isDuplicateName) {
                    window.showToast('Customer name already exists.', 'error');
                    return;
                }
                if (response.data.isDuplicateBusinessRegNo) {
                    window.showToast('Business registration number already exists.', 'error');
                    return;
                }

                // 3. Validation
                valid = true;
                newErrors = {
                    customerName: '',
                    customerBusinessRegNo: '',
                    customerTel: '',
                    customerManagerTel: '',
                    customerManagerEmail: ''
                };

                const customerBusinessRegNoRegex = /^\d{3}-\d{2}-\d{5}$/;
                const customerTelRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
                const customerManagerTelRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
                const customerManagerEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!customerBusinessRegNoRegex.test(form.customerBusinessRegNo)) {
                    newErrors.customerBusinessRegNo =
                        'Business registration number format is incorrect.\nExample: 123-45-67890';
                    valid = false;
                }
                if (form.customerTel && !customerTelRegex.test(form.customerTel)) {
                    newErrors.customerTel =
                        'Customer contact format is incorrect.\nExample: 02-456-7890';
                    valid = false;
                }
                if (form.customerManagerTel && !customerManagerTelRegex.test(form.customerManagerTel)) {
                    newErrors.customerManagerTel =
                        'Manager contact format is incorrect.\nExample: 010-1234-5678';
                    valid = false;
                }
                if (form.customerManagerEmail && !customerManagerEmailRegex.test(form.customerManagerEmail)) {
                    newErrors.customerManagerEmail =
                        'Manager email format is incorrect.\nExample: abc@example.com';
                    valid = false;
                }

                // Update error state
                setErrors(newErrors);

                // Stop saving if validation fails
                if (!valid) {
                    return;
                }

                // Perform save action after all validations pass
                onSave(form); // Pass saved data to parent component
                onClose(); // Close modal
            })
            .catch((error) => {
                console.error('Error during duplicate check:', error);
            });
    };

    if (!show) return null; // Check if modal should be displayed

    return (
        <div className="modal_overlay">
            <div className="modal_container customer">
                <div className="header">
                    <div>{customerData ? 'Edit Customer Information' : 'Customer Registration'}</div>
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button> {/* Modal close button */}
                </div>
                <div className="register-form">
                    <div className="left-column">
                        <div className="form-group">
                            <label>Customer Name<span className='span_red'>*</span></label>
                            <input
                                type="text"
                                name="customerName"
                                value={form.customerName || ''}
                                onChange={handleInputChange} />
                            {errors.customerName && (
                                <p className="field_error_msg"><i className="bi bi-exclamation-circle-fill"></i>{errors.customerName}</p>)}
                        </div>
                        <div className="form-group">
                            <label>Business Registration Number<span className='span_red'>*</span></label>
                            <input
                                type="text"
                                name="customerBusinessRegNo"
                                value={form.customerBusinessRegNo || ''}
                                onChange={handleInputChange}
                                className={errors.customerBusinessRegNo ? 'invalid' : ''} />
                            {errors.customerBusinessRegNo && (
                                <p className="field_error_msg">
                                    <i className="bi bi-exclamation-circle-fill"></i>{' '}
                                    <span dangerouslySetInnerHTML={{ __html: errors.customerBusinessRegNo.replace(/\n/g, '<br />') }} />
                                </p>

                            )}
                        </div>
                        <div className="form-group">
                            <label>Representative Name</label>
                            <input
                                type="text"
                                name="customerRepresentativeName"
                                value={form.customerRepresentativeName || ''}
                                onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Business Address</label>
                            <input
                                type="text"
                                name="customerAddr"
                                value={form.customerAddr || ''}
                                onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Customer Contact</label>
                            <input
                                type="text"
                                name="customerTel"
                                value={form.customerTel || ''}
                                onChange={handleInputChange}
                                className={errors.customerTel ? 'invalid' : ''} />
                            {errors.customerTel && (
                                <p
                                    className="field_error_msg"
                                    dangerouslySetInnerHTML={{
                                        __html: errors.customerTel.replace(/\n/g, '<br />'),
                                    }}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Fax Number</label>
                            <input
                                type="text"
                                name="customerFaxNo"
                                value={form.customerFaxNo || ''}
                                onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Customer Classification</label>
                            <select
                                name="customerType"
                                value={form.customerType || ''}
                                onChange={handleInputChange}>
                                <option value="">Select</option>
                                <option value="01">01. Customer Company</option>
                                <option value="02">02. Partner Company</option>
                                <option value="03">03. Head Office Company</option>
                                <option value="04">04. Other Company</option>
                            </select>
                        </div>
                    </div>
                    <div className="right-column">
                        <div className="form-group">
                            <label>Manager Name</label>
                            <input
                                type="text"
                                name="customerManagerName"
                                value={form.customerManagerName || ''}
                                onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Manager Contact</label>
                            <input
                                type="text"
                                name="customerManagerTel"
                                value={form.customerManagerTel || ''}
                                onChange={handleInputChange}
                                className={errors.customerManagerTel ? 'invalid' : ''} />
                            {errors.customerManagerTel && (
                                <p
                                    className="field_error_msg"
                                    dangerouslySetInnerHTML={{
                                        __html: errors.customerManagerTel.replace(/\n/g, '<br />'),
                                    }}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Manager Email</label>
                            <input
                                type="email"
                                name="customerManagerEmail"
                                value={form.customerManagerEmail || ''}
                                onChange={handleInputChange}
                                className={errors.customerManagerEmail ? 'invalid' : ''} />
                            {errors.customerManagerEmail && (
                                <p
                                    className="field_error_msg"
                                    dangerouslySetInnerHTML={{
                                        __html: errors.customerManagerEmail.replace(/\n/g, '<br />'),
                                    }}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Country Code</label>
                            <select
                                name="customerCountryCode"
                                value={form.customerCountryCode || ''}
                                onChange={handleInputChange}>
                                <option value="">Select</option>
                                <option value="KR">Korea (KR)</option>
                                <option value="US">United States (US)</option>
                                <option value="JP">Japan (JP)</option>
                                <option value="CN">China (CN)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>E-tax Invoice Availability</label>
                            <select
                                name="customerEtaxInvoiceYn"
                                value={form.customerEtaxInvoiceYn || ''}
                                onChange={handleInputChange}>
                                <option value="">Select</option>
                                <option value="Y">Y</option>
                                <option value="N">N</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Transaction Start Date</label>
                            <input
                                type="date"
                                name="customerTransactionStartDate"
                                value={form.customerTransactionStartDate || ''}
                                onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Transaction End Date</label>
                            <input
                                type="date"
                                name="customerTransactionEndDate"
                                value={form.customerTransactionEndDate || ''}
                                onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="submit" className="box blue" onClick={handleSubmit}>Register</button>
                </div>

                {/* Save confirmation modal */}
                {showConfirmModal && (
                    <ConfirmationModal
                        message="Do you want to register?"
                        onConfirm={handleConfirmSave}
                        onCancel={() => setShowConfirmModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

// Customer detail information modal
function CustomerDetailModal({ show, onClose, customer, onSave, onDelete }) {

    const [isEditMode, setIsEditMode] = useState(false); // Edit mode status
    const [editableCustomer, setEditableCustomer] = useState(customer || {}); // Editable customer data
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false); // Edit confirmation modal display status
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false); // Save confirmation modal display status
    const [errors, setErrors] = useState({ // Error messages
        customerName: '',
        customerBusinessRegNo: '',
        customerTel: '',
        customerManagerTel: '',
        customerManagerEmail: ''
    });

    // Reset edit mode and set customer data every time modal opens
    useEffect(() => {
        if (show) {
            setIsEditMode(false); // Reset edit mode
            setEditableCustomer(customer || {}); // Set existing customer data
            setErrors({
                customerName: '',
                customerBusinessRegNo: '',
                customerTel: '',
                customerManagerTel: '',
                customerManagerEmail: ''
            }); // Reset error messages
        }
    }, [show, customer]);

    // Toggle edit mode function
    const toggleEditMode = () => {
        if (isEditMode) return; // Do nothing if already in edit mode
        setShowEditConfirmModal(true); // Show edit confirmation modal
    };

    // Activate edit mode when confirmed in edit confirmation modal
    const handleConfirmEdit = () => {
        setIsEditMode(true); // Activate edit mode
        setShowEditConfirmModal(false); // Close edit confirmation modal
    };

    // Update state when input values change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableCustomer((prev) => ({ ...prev, [name]: value }));
    };

    // Save handling function: show save confirmation modal
    const handleSave = () => {
        setShowSaveConfirmModal(true); // Show save confirmation modal
    };

    // Perform actual save action when confirmed in save confirmation modal
    const handleConfirmSave = () => {

        // Required field validation
        let valid = true;
        let newErrors = {
            customerName: '',
            customerBusinessRegNo: '',
            customerTel: '',
            customerManagerTel: '',
            customerManagerEmail: ''
        };

        if (!editableCustomer.customerName.trim()) {
            newErrors.customerName = 'Customer name is a required field.';
            valid = false;
        }
        if (!editableCustomer.customerBusinessRegNo.trim()) {
            newErrors.customerBusinessRegNo = 'Business registration number is a required field.';
            valid = false;
        }

        // Update error state
        setErrors(newErrors);

        // Stop saving if required field validation fails
        if (!valid) {
            setShowSaveConfirmModal(false); // Close save confirmation modal
            return;
        }

        // Validation
        const customerBusinessRegNoRegex = /^\d{3}-\d{2}-\d{5}$/;
        const customerTelRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
        const customerManagerTelRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
        const customerManagerEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        valid = true;
        newErrors = {
            customerName: '',
            customerBusinessRegNo: '',
            customerTel: '',
            customerManagerTel: '',
            customerManagerEmail: ''
        };

        if (!customerBusinessRegNoRegex.test(editableCustomer.customerBusinessRegNo)) {
            newErrors.customerBusinessRegNo = 'Business registration number format is incorrect.\nExample: 123-45-67890';
            valid = false;
        }
        if (editableCustomer.customerTel && !customerTelRegex.test(editableCustomer.customerTel)) {
            newErrors.customerTel = 'Customer contact format is incorrect.\nExample: 02-456-7890';
            valid = false;
        }
        if (editableCustomer.customerManagerTel && !customerManagerTelRegex.test(editableCustomer.customerManagerTel)) {
            newErrors.customerManagerTel = 'Manager contact format is incorrect.\nExample: 010-1234-5678';
            valid = false;
        }
        if (editableCustomer.customerManagerEmail && !customerManagerEmailRegex.test(editableCustomer.customerManagerEmail)) {
            newErrors.customerManagerEmail = 'Manager email format is incorrect.\nExample: abc@example.com';
            valid = false;
        }

        // Update error state
        setErrors(newErrors);

        // Stop saving if validation fails
        if (!valid) {
            setShowSaveConfirmModal(false); // Close save confirmation modal
            return;
        }

        // Perform save action after all validations pass
        onSave(editableCustomer); // Pass saved data to parent component
        onClose(); // Close detail modal
        setShowSaveConfirmModal(false); // Close save confirmation modal
    };

    if (!show || !customer) return null; // Check if modal should be displayed

    return (
        <div className="modal_overlay">
            <div className="modal_container customer">
                <div className="header">
                    <div>{isEditMode ? 'Edit Customer Information' : 'Customer Detail Information'}</div>
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button> {/* Modal close button */}
                </div>
                <div className="detail-form">
                    <div className="left-column">
                        <div className="form-group">
                            <label>Customer Name{isEditMode && (<span className='span_red'>*</span>)}</label>
                            <input
                                type="text"
                                name="customerName"
                                value={editableCustomer.customerName || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                                className={errors.customerName ? 'invalid' : ''} />
                            {errors.customerName && (
                                <p className="field_error_msg"><i className="bi bi-exclamation-circle-fill"></i>{errors.customerName}</p>)}
                        </div>
                        <div className="form-group">
                            <label>Business Registration Number{isEditMode && (<span className='span_red'>*</span>)}</label>
                            <input
                                type="text"
                                name="customerBusinessRegNo"
                                value={editableCustomer.customerBusinessRegNo || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                                className={errors.customerBusinessRegNo ? 'invalid' : ''} />
                            {errors.customerBusinessRegNo && (
                                <p className="field_error_msg">
                                    <i className="bi bi-exclamation-circle-fill"></i>{' '}
                                    <span dangerouslySetInnerHTML={{ __html: errors.customerBusinessRegNo.replace(/\n/g, '<br />') }} />
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Representative Name</label>
                            <input
                                type="text"
                                name="customerRepresentativeName"
                                value={editableCustomer.customerRepresentativeName || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                            />
                        </div>
                        <div className="form-group">
                            <label>Business Address</label>
                            <input
                                type="text"
                                name="customerAddr"
                                value={editableCustomer.customerAddr || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                            />
                        </div>
                        <div className="form-group">
                            <label>Customer Contact</label>
                            <input
                                type="text"
                                name="customerTel"
                                value={editableCustomer.customerTel || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                                className={errors.customerTel ? 'invalid' : ''} />
                            {errors.customerTel && (
                                <p
                                    className="field_error_msg"
                                    dangerouslySetInnerHTML={{
                                        __html: errors.customerTel.replace(/\n/g, '<br />'),
                                    }}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Fax Number</label>
                            <input
                                type="text"
                                name="customerFaxNo"
                                value={editableCustomer.customerFaxNo || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                            />
                        </div>
                        <div className="form-group">
                            <label>Customer Classification</label>
                            <select name="customerType" value={editableCustomer.customerType || ''} onChange={handleChange}
                                    disabled={!isEditMode}>
                                <option value="">Select</option>
                                <option value="01">01. Customer Company</option>
                                <option value="02">02. Partner Company</option>
                                <option value="03">03. Head Office Company</option>
                                <option value="04">04. Other Company</option>
                            </select>
                        </div>
                    </div>
                    <div className="right-column">
                        <div className="form-group">
                            <label>Manager Name</label>
                            <input
                                type="text"
                                name="customerManagerName"
                                value={editableCustomer.customerManagerName || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                            />
                        </div>
                        <div className="form-group">
                            <label>Manager Contact</label>
                            <input
                                type="text"
                                name="customerManagerTel"
                                value={editableCustomer.customerManagerTel || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                                className={errors.customerManagerTel ? 'invalid' : ''} />
                            {errors.customerManagerTel && (
                                <p
                                    className="field_error_msg"
                                    dangerouslySetInnerHTML={{
                                        __html: errors.customerManagerTel.replace(/\n/g, '<br />'),
                                    }}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Manager Email</label>
                            <input
                                type="email"
                                name="customerManagerEmail"
                                value={editableCustomer.customerManagerEmail || ''}
                                onChange={handleChange}
                                readOnly={!isEditMode}
                                className={errors.customerManagerEmail ? 'invalid' : ''} />
                            {errors.customerManagerEmail && (
                                <p
                                    className="field_error_msg"
                                    dangerouslySetInnerHTML={{
                                        __html: errors.customerManagerEmail.replace(/\n/g, '<br />'),
                                    }}
                                />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Country Code</label>
                            <select name="customerCountryCode" value={editableCustomer.customerCountryCode || ''}
                                    onChange={handleChange} disabled={!isEditMode}>
                                <option value="">Select</option>
                                <option value="KR">Korea (+82)</option>
                                <option value="US">United States (+1)</option>
                                <option value="JP">Japan (+81)</option>
                                <option value="CN">China (+86)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>E-tax Invoice Availability</label>
                            <select name="customerEtaxInvoiceYn" value={editableCustomer.customerEtaxInvoiceYn || ''}
                                    onChange={handleChange}
                                    disabled={!isEditMode}>
                                <option value="">Select</option>
                                <option value="Y">Y</option>
                                <option value="N">N</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Transaction Start Date</label>
                            <input type="date" name="customerTransactionStartDate"
                                   value={editableCustomer.customerTransactionStartDate ? editableCustomer.customerTransactionStartDate.substring(0, 10) : ''} onChange={handleChange}
                                   readOnly={!isEditMode} />
                        </div>
                        <div className="form-group">
                            <label>Transaction End Date</label>
                            <input type="date" name="customerTransactionEndDate"
                                   value={editableCustomer.customerTransactionEndDate ? editableCustomer.customerTransactionEndDate.substring(0, 10) : ''} onChange={handleChange}
                                   readOnly={!isEditMode} />
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    {isEditMode ? (
                        <button className="box blue" type="button" onClick={handleSave}>Save</button>
                    ) : (
                        <>
                            {/* Conditional rendering based on deleted status */}
                            {editableCustomer.customerDeleteYn !== 'Y' ? (
                                <>
                                    <button className="box blue" type="button" onClick={toggleEditMode}>Edit</button>
                                    <button className="box red" type="button" onClick={onDelete}>Delete</button>
                                </>
                            ) : (<></>)}
                        </>
                    )}
                </div>

                {/* Edit confirmation modal */}
                {showEditConfirmModal && (
                    <ConfirmationModal
                        message="Do you want to edit?"
                        onConfirm={handleConfirmEdit}
                        onCancel={() => setShowEditConfirmModal(false)}
                    />
                )}

                {/* Save confirmation modal */}
                {showSaveConfirmModal && (
                    <ConfirmationModal
                        message="Do you want to save?"
                        onConfirm={handleConfirmSave}
                        onCancel={() => setShowSaveConfirmModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

// Confirmation modal component
function ConfirmationModal({ message, onConfirm, onCancel }) {
    return (
        <div className="modal_overlay">
            <div className="modal_confirm">
                {/* Message output area including icon */}
                <div className="icon_wrap"><i className="bi bi-exclamation-circle"></i></div>
                <p className='msg'>{message}</p>
                {/* Confirm and cancel buttons */}
                <div className="modal-actions">
                    <button className="box red" onClick={onConfirm}>Confirm</button>
                    <button className="box gray" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

// Customer list
function CustomerList() {

    const [loading, setLoading] = useState(false); // 🔴 Loading state added
    const [filter, setFilter] = useState(''); // Search term state
    const [itemsPerPage] = useState(20); // Items per page
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const [selectedCustomer, setSelectedCustomer] = useState(null); // Selected customer information
    const [showRegisterModal, setShowRegisterModal] = useState(false); // Registration modal display status
    const [showDetailModal, setShowDetailModal] = useState(false); // Detail modal display status
    const [selectedCustomers, setSelectedCustomers] = useState([]); // Selected customer number list
    const [customers, setCustomers] = useState([]); // Complete customer list
    const [filterType, setFilterType] = useState('active'); // All customers, deleted customers distinction

    const [sortColumn, setSortColumn] = useState('customerName'); // Default sort column set to customerName
    const [sortOrder, setSortOrder] = useState('asc'); // Default sort is ascending

    const fetchData = () => {
        setLoading(true); // Start loading
        axios.get('/api/customer/getList')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setCustomers(response.data);
                    setLoading(false); // End loading
                } else {
                    console.error("Error: Expected an array but got ", typeof response.data);
                }
            })
            .catch(error => {
                console.error("Error fetching customer data:", error);
                setLoading(false); // End loading
            });
    };

    // Fetch customer list data
    useEffect(() => {
        fetchData();
    }, []);

    // Function to show all customers (including deleted)
    const showAllCustomers = () => {
        setFilterType('all');
    };

    // Function to show only registered customers
    const showActiveCustomers = () => {
        setFilterType('active')
    };

    // Function to show only deleted customers
    const showDeletedCustomers = () => {
        setFilterType('deleted')
    };

    // Filter customer list based on search term and filter type
    const filteredCustomers = useMemo(() => {
        let filtered = customers.filter(customer => {
            // Filtering logic (apply filterType and search term)
            const isIncludedByFilterType =
                filterType === 'all' ||
                (filterType === 'active' && customer.customerDeleteYn === 'N') ||
                (filterType === 'deleted' && customer.customerDeleteYn === 'Y');

            const searchText = filter.toLowerCase();
            const isIncludedBySearch =
                (customer.customerName ? customer.customerName.toLowerCase() : '').includes(searchText) ||
                (customer.customerBusinessRegNo ? customer.customerBusinessRegNo.toLowerCase() : '').includes(searchText) ||
                (customer.customerCountryCode ? customer.customerCountryCode.toLowerCase() : '').includes(searchText) ||
                (customer.customerManagerName ? customer.customerManagerName.toLowerCase() : '').includes(searchText);

            return isIncludedByFilterType && isIncludedBySearch;
        });

        // Apply sorting logic
        filtered.sort((a, b) => {
            let aValue = a[sortColumn] ? a[sortColumn].toString() : '';
            let bValue = b[sortColumn] ? b[sortColumn].toString() : '';

            // Handle numeric columns
            if (sortColumn === 'customerNo') {
                aValue = Number(aValue);
                bValue = Number(bValue);
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            } else {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        return filtered;
    }, [customers, filterType, filter, sortColumn, sortOrder]);

    // Customer sorting function
    const sortCustomers = (column) => {
        const order = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortOrder(order);
    };

    // Customer selection handling function (checkbox)
    const handleSelectCustomer = (customerNo) => {
        setSelectedCustomers(prevSelected =>
            prevSelected.includes(customerNo)
                ? prevSelected.filter(id => id !== customerNo)
                : [...prevSelected, customerNo]
        );
    };

    // Selected customer deletion handling function
    const handleDeleteAll = () => {
        if (selectedCustomers.length === 0) {
            window.showToast('Please select customers to delete.', 'error');
            return;
        }

        window.confirmCustom('Do you want to delete all selected customers?').then(result => {
            if (result) {
                const deletePromises = selectedCustomers.map((customerNo) =>
                    axios
                        .delete(`/api/customer/delete/${customerNo}`)
                        .then(() => {
                            // Change customerDeleteYn to 'Y' for that customer
                            setCustomers((prevCustomers) =>
                                prevCustomers.map((c) =>
                                    c.customerNo === customerNo
                                        ? {
                                            ...c,
                                            customerDeleteYn: 'Y',
                                            customerDeleteDate: new Date().toISOString(),
                                        }
                                        : c
                                )
                            );
                        })
                        .catch((error) => console.error('Error during customer deletion:', error))
                );
                Promise.all(deletePromises).then(() => {
                    setFilterType('deleted'); // Change status to 'deleted' to immediately show deleted items
                    window.showToast('Deleted successfully.'); // Delete completion message
                    setSelectedCustomers([]); // Reset selected customers
                });
            }
        });
    };

    // Search term delete button click handling function (search term reset only)
    const handleFilterReset = () => {
        setFilter(''); // Reset search term
    };

    // Customer save handling function (registration and edit)
    const handleSaveCustomer = (customerData) => {
        if (selectedCustomer) {
            // Edit logic
            axios
                .put(`/api/customer/update/${selectedCustomer.customerNo}`, customerData)
                .then((response) => {
                    setCustomers(
                        customers.map((c) =>
                            c.customerNo === selectedCustomer.customerNo ? response.data : c
                        )
                    );
                    setShowDetailModal(false);
                    window.showToast('Edited successfully.'); // Edit completion message
                })
                .catch((error) => console.error('Error during customer edit:', error));
        } else {
            // Registration logic
            axios
                .post('/api/customer/register', customerData)
                .then((response) => {
                    setCustomers([...customers, response.data]);
                    setShowRegisterModal(false);
                    window.showToast('Registered successfully.'); // Registration completion message
                })
                .catch((error) => console.error('Error during customer registration:', error));
        }
    };

    // Customer deletion handling function
    const handleDeleteCustomer = () => {
        window.confirmCustom("Do you really want to delete?").then(result => {
            if (result) {
                axios
                    .delete(`/api/customer/delete/${selectedCustomer.customerNo}`)
                    .then(() => {
                        // Change customerDeleteYn to 'Y' for that customer
                        setCustomers(
                            customers.map((c) =>
                                c.customerNo === selectedCustomer.customerNo
                                    ? {
                                        ...c,
                                        customerDeleteYn: 'Y',
                                        customerDeleteDate: new Date().toISOString(),
                                    }
                                    : c
                            )
                        );
                        setFilterType('deleted'); // Change status to 'deleted' to immediately show deleted items
                        window.showToast('Deleted successfully.'); // Delete completion message
                        setShowDetailModal(false);
                    })
                    .catch((error) => console.error('Error during customer deletion:', error));
            }
        });
    };

    // Search term delete button click handling function
    const handleSearchDel = () => {
        setFilter(''); // Reset search term
    };

    // Open customer registration modal
    const openRegisterModal = () => {
        setSelectedCustomer(null); // Reset existing selected customer information for new customer registration
        setShowRegisterModal(true);
    };

    // Close customer registration modal
    const closeRegisterModal = () => setShowRegisterModal(false);

    // Open customer detail modal
    const openDetailModal = (customer) => {
        setSelectedCustomer(customer); // Set selected customer information
        setShowDetailModal(true); // Show detail modal
    };

    // Close customer detail modal
    const closeDetailModal = () => setShowDetailModal(false);

    // Calculate total pages
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    return (
        <Layout currentMenu="customer">
            <main className="main-content menu_customer">
                <div className="menu_title">
                    <div className="sub_title">Customer Management</div>
                    <div className="main_title">Customer List</div>
                </div>
                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            {/* Search term input */}
                            <div className={`search_box ${filter ? 'has_text' : ''}`}>
                                <label className={`label_floating ${filter ? 'active' : ''}`}>Enter customer name, business registration number, country code, manager name</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                                {/* Search term delete button */}
                                {filter && (
                                    <button
                                        className="btn-del"
                                        onClick={() => setFilter('')}
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            <div className="radio_box">
                                <span>Status</span>
                                <input
                                    type="radio"
                                    id="all"
                                    name="filterType"
                                    value="all"
                                    checked={filterType === 'all'}
                                    onChange={showAllCustomers}
                                />
                                <label htmlFor="all">All</label>
                                <input
                                    type="radio"
                                    id="active"
                                    name="filterType"
                                    value="active"
                                    checked={filterType === 'active'}
                                    onChange={showActiveCustomers}
                                />
                                <label htmlFor="active">Active</label>
                                <input
                                    type="radio"
                                    id="deleted"
                                    name="filterType"
                                    value="deleted"
                                    checked={filterType === 'deleted'}
                                    onChange={showDeletedCustomers}
                                />
                                <label htmlFor="deleted">Deleted</label>
                            </div>
                        </div>
                        <div className="right">
                            <button className="box color" onClick={openRegisterModal}>
                                <i className="bi bi-plus-circle"></i> Register
                            </button>
                        </div>
                    </div>
                    <div className="table_wrap">
                        <table>
                            <thead>
                            <tr>
                                <th>
                                    <label className="chkbox_label">
                                        <input
                                            type="checkbox"
                                            className="chkbox"
                                            onChange={(e) => setSelectedCustomers(e.target.checked ? filteredCustomers.map(c => c.customerNo) : [])}
                                        />
                                        <i className="chkbox_icon">
                                            <i className="bi bi-check-lg"></i>
                                        </i>
                                    </label>
                                </th>
                                <th>No.</th>
                                <th>
                                    <div className={`order_wrap ${sortColumn === 'customerName' ? 'active' : ''}`}>
                                        <span>Customer</span>
                                        <button className="btn_order" onClick={() => sortCustomers('customerName')}>
                                            <i className={`bi ${sortColumn === 'customerName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortColumn === 'customerBusinessRegNo' ? 'active' : ''}`}>
                                        <span>Business Registration Number</span>
                                        <button className="btn_order" onClick={() => sortCustomers('customerBusinessRegNo')}>
                                            <i className={`bi ${sortColumn === 'customerBusinessRegNo' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortColumn === 'customerCountryCode' ? 'active' : ''}`}>
                                        <span>Country Code</span>
                                        <button className="btn_order" onClick={() => sortCustomers('customerCountryCode')}>
                                            <i className={`bi ${sortColumn === 'customerCountryCode' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortColumn === 'customerManagerName' ? 'active' : ''}`}>
                                        <span>Manager Name</span>
                                        <button className="btn_order" onClick={() => sortCustomers('customerManagerName')}>
                                            <i className={`bi ${sortColumn === 'customerManagerName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortColumn === 'customerInsertDate' ? 'active' : ''}`}>
                                        <span>Registration Date/Time</span>
                                        <button className="btn_order" onClick={() => sortCustomers('customerInsertDate')}>
                                            <i className={`bi ${sortColumn === 'customerInsertDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortColumn === 'customerUpdateDate' ? 'active' : ''}`}>
                                        <span>Edit Date/Time</span>
                                        <button className="btn_order" onClick={() => sortCustomers('customerUpdateDate')}>
                                            <i className={`bi ${sortColumn === 'customerUpdateDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortColumn === 'customerDeleteDate' ? 'active' : ''}`}>
                                        <span>Deletion Date/Time</span>
                                        <button className="btn_order" onClick={() => sortCustomers('customerDeleteDate')}>
                                            <i className={`bi ${sortColumn === 'customerDeleteDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr className="tr_empty">
                                    <td colSpan="10"> {/* Center loading animation */}
                                        <div className="loading">
                                            <span></span> {/* First circle */}
                                            <span></span> {/* Second circle */}
                                            <span></span> {/* Third circle */}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                // Show tr_empty when no results found
                                <tr className="tr_empty">
                                    <td colSpan="10">
                                        <div className="no_data">
                                            <i className="bi bi-exclamation-triangle"></i>
                                            No results found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Display customer list
                                filteredCustomers
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((customer, index) => (
                                        <tr key={customer.customerNo}
                                            className={
                                                selectedCustomers.includes(customer.customerNo)
                                                    ? ('selected_row')  // Selected row
                                                    : ''
                                            }
                                        >
                                            <td>
                                                {/* Conditional rendering based on deleted status */}
                                                {customer.customerDeleteYn !== 'Y' ? (
                                                    <label className="chkbox_label">
                                                        <input
                                                            type="checkbox"
                                                            className="chkbox"
                                                            checked={selectedCustomers.includes(customer.customerNo)}
                                                            onChange={() => handleSelectCustomer(customer.customerNo)}
                                                        />
                                                        <i className="chkbox_icon">
                                                            <i className="bi bi-check-lg"></i>
                                                        </i>
                                                    </label>
                                                ) : (
                                                    <span className="label_del">Deleted</span>
                                                )}
                                            </td>
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>{customer.customerName || ''}</td>
                                            <td>{customer.customerBusinessRegNo || ''}</td>
                                            <td>{customer.customerCountryCode || ''}</td>
                                            <td>{customer.customerManagerName || ''}</td>
                                            <td>{formatDateTime(customer.customerInsertDate)}</td>
                                            <td>{customer.customerUpdateDate ? formatDateTime(customer.customerUpdateDate) : '-'}</td>
                                            <td>
                                                {customer.customerDeleteYn === 'Y' && customer.customerDeleteDate
                                                    ? formatDateTime(customer.customerDeleteDate)
                                                    : '-'}
                                            </td>
                                            <td>
                                                <div className="btn_group">
                                                    <button className="box small" onClick={() => openDetailModal(customer)}>View Details</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="pagination-container">
                    <div className="pagination-sub left">
                        <button className="box" onClick={handleDeleteAll}><i className="bi bi-trash3"></i> Delete Selected</button>
                    </div>
                    {/* Center: Pagination */}
                    <div className="pagination">
                        {/* 'First' button */}
                        {currentPage > 1 && (
                            <button className="box icon first" onClick={() => setCurrentPage(1)}>
                                <i className="bi bi-chevron-double-left"></i>
                            </button>
                        )}

                        {/* 'Previous' button */}
                        {currentPage > 1 && (
                            <button className="box icon left" onClick={() => setCurrentPage(currentPage - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        )}

                        {/* Page number block */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                            const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
                            const page = startPage + index;
                            return (
                                page <= totalPages && (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={currentPage === page ? 'box active' : 'box'}
                                    >
                                        {page}
                                    </button>
                                )
                            );
                        })}

                        {/* 'Next' button */}
                        {currentPage < totalPages && (
                            <button className="box icon right" onClick={() => setCurrentPage(currentPage + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        )}

                        {/* 'Last' button */}
                        {currentPage < totalPages && (
                            <button className="box icon last" onClick={() => setCurrentPage(totalPages)}>
                                <i className="bi bi-chevron-double-right"></i>
                            </button>
                        )}
                    </div>
                    <div className="pagination-sub right"></div>
                </div>

                {/* Modals */}
                <CustomerDetailModal
                    show={showDetailModal}
                    onClose={closeDetailModal}
                    customer={selectedCustomer}
                    onSave={handleSaveCustomer}
                    onDelete={handleDeleteCustomer}
                />
                <CustomerRegisterModal
                    show={showRegisterModal}
                    onClose={closeRegisterModal}
                    onSave={handleSaveCustomer}
                    customerData={selectedCustomer}
                />
            </main>
        </Layout>
    );
}

// Final rendering
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <CustomerList />
    </BrowserRouter>
);