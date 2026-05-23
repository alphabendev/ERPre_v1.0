import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css'; // Common CSS file
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/customer/CustomerList.css';
import axios from 'axios';
import Pagination from '../common/Pagination'; // Shared Pagination component

// Date formatting function
const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

interface CustomerData {
    customerNo?: number;
    customerName: string;
    customerTel: string;
    customerRepresentativeName: string;
    customerBusinessRegNo: string;
    customerAddr: string;
    customerFaxNo: string;
    customerManagerName: string;
    customerManagerEmail: string;
    customerManagerTel: string;
    customerCountryCode: string;
    customerType: string;
    customerEtaxInvoiceYn: string;
    customerTransactionStartDate: string;
    customerTransactionEndDate: string;
    customerDeleteYn?: 'Y' | 'N';
    customerDeleteDate?: string;
    customerInsertDate?: string;
    customerUpdateDate?: string;
}

interface RegisterModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: CustomerData) => void;
    customerData: CustomerData | null;
}

// Customer registration modal
function CustomerRegisterModal({ show, onClose, onSave, customerData }: RegisterModalProps) {
    const [form, setForm] = useState<CustomerData>({
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
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Form submission handling
    const handleSubmit = (e: React.FormEvent) => {
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
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
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
            </div>
        </div>
    );
}

interface DetailModalProps {
    show: boolean;
    onClose: () => void;
    customer: CustomerData | null;
    onSave: (data: CustomerData) => void;
    onDelete: () => void;
}

// Customer detail information modal
function CustomerDetailModal({ show, onClose, customer, onSave, onDelete }: DetailModalProps) {
    const [isEditMode, setIsEditMode] = useState(false); // Edit mode status
    const [editableCustomer, setEditableCustomer] = useState<CustomerData>(customer || {} as CustomerData); // Editable customer data
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false); // Edit confirmation modal display status
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false); // Save confirmation modal display status
    const [errors, setErrors] = useState({
        customerName: '',
        customerBusinessRegNo: '',
        customerTel: '',
        customerManagerTel: '',
        customerManagerEmail: ''
    });

    // Reset edit mode and set customer data every time modal opens
    useEffect(() => {
        if (show) {
            setIsEditMode(false);
            setEditableCustomer(customer || {} as CustomerData);
            setErrors({
                customerName: '',
                customerBusinessRegNo: '',
                customerTel: '',
                customerManagerTel: '',
                customerManagerEmail: ''
            });
        }
    }, [show, customer]);

    // Toggle edit mode function
    const toggleEditMode = () => {
        if (isEditMode) return;
        setShowEditConfirmModal(true);
    };

    // Activate edit mode when confirmed in edit confirmation modal
    const handleConfirmEdit = () => {
        setIsEditMode(true);
        setShowEditConfirmModal(false);
    };

    // Update state when input values change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableCustomer((prev) => ({ ...prev, [name]: value }));
    };

    // Save handling function: show save confirmation modal
    const handleSave = () => {
        setShowSaveConfirmModal(true);
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

        setErrors(newErrors);

        if (!valid) {
            setShowSaveConfirmModal(false);
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

        setErrors(newErrors);

        if (!valid) {
            setShowSaveConfirmModal(false);
            return;
        }

        // Perform save action after all validations pass
        onSave(editableCustomer);
        onClose();
        setShowSaveConfirmModal(false);
    };

    if (!show || !customer) return null;

    return (
        <div className="modal_overlay">
            <div className="modal_container customer">
                <div className="header">
                    <div>{isEditMode ? 'Edit Customer Information' : 'Customer Detail Information'}</div>
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
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
                            {editableCustomer.customerDeleteYn !== 'Y' ? (
                                <>
                                    <button className="box blue" type="button" onClick={toggleEditMode}>Edit</button>
                                    <button className="box red" type="button" onClick={onDelete}>Delete</button>
                                </>
                            ) : null}
                        </>
                    )}
                </div>

                {showEditConfirmModal && (
                    <ConfirmationModal
                        message="Do you want to edit?"
                        onConfirm={handleConfirmEdit}
                        onCancel={() => setShowEditConfirmModal(false)}
                    />
                )}

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
}

interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Confirmation modal component
function ConfirmationModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div className="modal_overlay">
            <div className="modal_confirm">
                <div className="icon_wrap"><i className="bi bi-exclamation-circle"></i></div>
                <p className='msg'>{message}</p>
                <div className="modal-actions">
                    <button className="box red" onClick={onConfirm}>Confirm</button>
                    <button className="box gray" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

// Customer list component
function CustomerList() {
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState(''); // Search term state
    const [itemsPerPage, setItemsPerPage] = useState(20); // Items per page
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null); // Selected customer info
    const [showRegisterModal, setShowRegisterModal] = useState(false); // Registration modal display status
    const [showDetailModal, setShowDetailModal] = useState(false); // Detail modal display status
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]); // Selected customer number list
    const [customers, setCustomers] = useState<CustomerData[]>([]); // Complete customer list
    const [filterType, setFilterType] = useState<'all' | 'active' | 'deleted'>('active');

    const [sortColumn, setSortColumn] = useState<keyof CustomerData>('customerName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchData = () => {
        setLoading(true);
        axios.get('/api/customer/getList')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setCustomers(response.data);
                } else {
                    console.error("Error: Expected an array but got ", typeof response.data);
                }
            })
            .catch(error => {
                console.error("Error fetching customer data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Fetch customer list data
    useEffect(() => {
        fetchData();
    }, []);

    // Filter customer list based on search term and filter type
    const filteredCustomers = useMemo(() => {
        let filtered = customers.filter(customer => {
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
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            let aValue = aVal ? aVal.toString() : '';
            let bValue = bVal ? bVal.toString() : '';

            if (sortColumn === 'customerNo') {
                const aNum = Number(aValue);
                const bNum = Number(bValue);
                return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
            } else {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        return filtered;
    }, [customers, filterType, filter, sortColumn, sortOrder]);

    const sortCustomers = (column: keyof CustomerData) => {
        const order = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortOrder(order);
    };

    const handleSelectCustomer = (customerNo: number) => {
        setSelectedCustomers(prevSelected =>
            prevSelected.includes(customerNo)
                ? prevSelected.filter(id => id !== customerNo)
                : [...prevSelected, customerNo]
        );
    };

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
                    setFilterType('deleted'); // Show deleted items
                    window.showToast('Deleted successfully.');
                    setSelectedCustomers([]);
                });
            }
        });
    };

    const handleSaveCustomer = (customerData: CustomerData) => {
        if (selectedCustomer && selectedCustomer.customerNo) {
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
                    window.showToast('Edited successfully.');
                })
                .catch((error) => console.error('Error during customer edit:', error));
        } else {
            // Registration logic
            axios
                .post('/api/customer/register', customerData)
                .then((response) => {
                    setCustomers([...customers, response.data]);
                    setShowRegisterModal(false);
                    window.showToast('Registered successfully.');
                })
                .catch((error) => console.error('Error during customer registration:', error));
        }
    };

    const handleDeleteCustomer = () => {
        if (!selectedCustomer || !selectedCustomer.customerNo) return;
        window.confirmCustom("Do you really want to delete?").then(result => {
            if (result) {
                axios
                    .delete(`/api/customer/delete/${selectedCustomer.customerNo}`)
                    .then(() => {
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
                        setFilterType('deleted');
                        window.showToast('Deleted successfully.');
                        setShowDetailModal(false);
                    })
                    .catch((error) => console.error('Error during customer deletion:', error));
            }
        });
    };

    const openRegisterModal = () => {
        setSelectedCustomer(null);
        setShowRegisterModal(true);
    };

    const closeRegisterModal = () => setShowRegisterModal(false);

    const openDetailModal = (customer: CustomerData) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => setShowDetailModal(false);

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
                            <div className={`search_box ${filter ? 'has_text' : ''}`}>
                                <label className={`label_floating ${filter ? 'active' : ''}`}>Enter name, business reg no, country code, or manager</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                                {filter && (
                                    <button className="btn-del" onClick={() => setFilter('')}>
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
                                    onChange={() => { setFilterType('all'); setCurrentPage(1); }}
                                />
                                <label htmlFor="all">All</label>
                                <input
                                    type="radio"
                                    id="active"
                                    name="filterType"
                                    value="active"
                                    checked={filterType === 'active'}
                                    onChange={() => { setFilterType('active'); setCurrentPage(1); }}
                                />
                                <label htmlFor="active">Active</label>
                                <input
                                    type="radio"
                                    id="deleted"
                                    name="filterType"
                                    value="deleted"
                                    checked={filterType === 'deleted'}
                                    onChange={() => { setFilterType('deleted'); setCurrentPage(1); }}
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
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const activeCustomerIds = filteredCustomers
                                                        .filter(c => c.customerDeleteYn !== 'Y')
                                                        .map(c => c.customerNo as number);
                                                    setSelectedCustomers(activeCustomerIds);
                                                } else {
                                                    setSelectedCustomers([]);
                                                }
                                            }}
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
                                    <td colSpan={10}>
                                        <div className="loading">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr className="tr_empty">
                                    <td colSpan={10}>
                                        <div className="no_data">
                                            <i className="bi bi-exclamation-triangle"></i>
                                            No results found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((customer, index) => (
                                        <tr key={customer.customerNo}
                                            className={
                                                customer.customerNo && selectedCustomers.includes(customer.customerNo)
                                                    ? 'selected_row'
                                                    : ''
                                            }
                                        >
                                            <td>
                                                {customer.customerDeleteYn !== 'Y' ? (
                                                    <label className="chkbox_label">
                                                        <input
                                                            type="checkbox"
                                                            className="chkbox"
                                                            checked={customer.customerNo ? selectedCustomers.includes(customer.customerNo) : false}
                                                            onChange={() => customer.customerNo && handleSelectCustomer(customer.customerNo)}
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
                                            <td>{formatDateTime(customer.customerInsertDate || null)}</td>
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
                    {/* Integrated clean Pagination component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredCustomers.length}
                        isLoading={loading}
                        pageInputValue={currentPage.toString()}
                        handlePage={(page) => setCurrentPage(page)}
                        handleItemsPerPageChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        handlePageInputChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 1 && val <= totalPages) {
                                setCurrentPage(val);
                            }
                        }}
                        handleDeleteSelected={handleDeleteAll}
                        selectedItems={selectedCustomers}
                        showFilters={true}
                    />
                </div>
            </main>

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
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <BrowserRouter>
        <CustomerList />
    </BrowserRouter>
);