import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css';
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/hr/EmployeeList.css';
import axios from 'axios';
import { formatDate } from '../../util/dateUtils'
import { add, format } from 'date-fns';
import { useDebounce } from '../common/useDebounce';

function EmployeeList() {
    const [loading, setLoading] = useState(false); // 🔴 Add loading state
    const [employees, setEmployees] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [currentView, setCurrentView] = useState('employeesN');

    // Array of searched employees
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    // const debouncedFilteredEmployees = useDebounce(filteredEmployees,1000);
    // Search
    const [searchEmployee, setSearchEmployee] = useState('');
    const debouncedSearchEmployee = useDebounce(searchEmployee, 300);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    // Modal related (hidden by default)
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [showInsertModal, setShowInsertModal] = useState(false);

    // 🟡 Initial screen shows only active employees
    useEffect(() => {
        pageEmployeesN(1);
    }, []);

    // 🟡 Display only searched employees on screen
    useEffect(() => {
        if (debouncedSearchEmployee === '') {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(employee => employee.employeeName.includes(debouncedSearchEmployee));
            setFilteredEmployees(filtered);
        }
    }, [debouncedSearchEmployee, employees])

    // Registration functionality
    const [newEmployee, setNewEmployee] = useState({
        employeeId: '',
        employeePw: '',
        employeeName: '',
        employeeEmail: '',
        employeeTel: '',
        employeeRole: ''
    });

    //    const handleRegiClick = () => {
    //        window.location.href = "/employeeRegister";
    //    }; Page navigation, no longer used

    //    const showTwentyEmployees = () => {
    //        pageEmployees(page);
    //
    //    }; Query button must be pressed to query, no longer used

    // Active employees only
    const pageEmployeesN = (page) => {
        setLoading(true); // Start loading
        axios.get(`/api/employeeList?page=${page}&size=20`)
            .then(response => {
                console.log('Response data:', response.data);
                setEmployees(response.data.content);
                setTotalPages(response.data.totalPages);
                setSelectedEmployees(new Array(response.data.content.length).fill(false));
                setLoading(false); // End loading
            })

    };

    // Deleted employees only
    const pageEmployeesY = (page) => {
        setLoading(true); // Start loading
        axios.get(`/api/employeeListY?page=${page}&size=20`)
            .then(response => {
                console.log('Response data:', response.data);
                setEmployees(response.data.content);
                setTotalPages(response.data.totalPages);
                setSelectedEmployees(new Array(response.data.content.length).fill(false));
                setLoading(false); // End loading
            })

    };

    // All employees
    const pageAllEmployees = (page) => {
        setLoading(true); // Start loading
        axios.get(`/api/allEmployees?page=${page}&size=20`)
            .then(response => {
                console.log('All employees query response data:', response.data);
                setEmployees(response.data.content);
                setTotalPages(response.data.totalPages);
                setSelectedEmployees(new Array(response.data.content.length).fill(false));
                setLoading(false); // End loading
            });
    };

    // Select all checkbox
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedEmployees(new Array(employees.length).fill(newSelectAll));
    };

    // Individual checkbox
    const handleSelect = (index) => {
        const updatedSelection = [...selectedEmployees];
        updatedSelection[index] = !updatedSelection[index];
        setSelectedEmployees(updatedSelection);

        if (updatedSelection.includes(false)) {
            setSelectAll(false);
        } else {
            setSelectAll(true);
        }
    };

    // When page changes
    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            if (currentView === 'employeesN') {
                pageEmployeesN(newPage);  // View active employees only
            } else if (currentView === 'employeesY') {
                pageEmployeesY(newPage);  // View deleted employees only
            } else if (currentView === 'allEmployees') {
                pageAllEmployees(newPage);  // View all employees
            }
        }
    };

    // Paging when querying all employees including deleted ones
    const PageChangeAllEmployees = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            pageAllEmployees(newPage);  // Change page with query including deleted employees
        }
    };

    // Soft delete only checked items
    const checkedDelete = () => {
        const selectedId = employees
            .filter((_, index) => selectedEmployees[index])  // Filter only selected employees
            .map(employee => employee.employeeId);  // Extract IDs of selected employees

        if (selectedId.length === 0) {
            // Show warning message immediately when no items are checked
            window.showToast("Please select employees to delete.", 'error');
            return;  // Don't proceed further
        }

        // Ask for deletion confirmation only when items are selected
        window.confirmCustom('Do you want to delete the selected employees?').then(result => {
            if (result) {
                // Send delete request to server
                axios.post('/api/deleteEmployees', selectedId)
                    .then(response => {
                        window.showToast("Deletion completed.");
                        pageEmployeesN(1);  // Refresh page after deletion
                    })
                    .catch(error => {
                        console.error('Error occurred during deletion: ', error);
                    });

                console.log('Employee IDs to delete: ', selectedId);  // Log selected employee IDs
            }
        });
    };

    ////////////// Modal ///////////

    // Open modify info modal
    const openModifyModal = (employee) => {
        // const selectedIndex = selectedEmployees.findIndex(selected => selected);
        // if (selectedIndex === -1) {
        //     window.showToast('Please select an employee to modify.', 'error');
        //     return;
        // }

        // const employeeToModify = employees[selectedIndex];
        //        if(!employee) {
        //            console.error('No selected employee information');
        //            return;
        //        }
        //        console.log(employee)
        setSelectedEmployee(employee);
        setShowModifyModal(true);
    };

    // Close modify info modal
    const closeModifyModal = () => {
        setShowModifyModal(false);
        setSelectedEmployee(null);
    };

    // 🟢 Close window when modal background is clicked (modify)
    const handleModifyBackgroundClick = (e) => {
        if (e.target.className === 'modal_overlay') {
            closeModifyModal();
        }
    };

    // Save modified employee info and send to server
    const handleModifySubmit = () => {
        if (!validateEmployeeData(selectedEmployee)) return;

        axios.put(`/api/updateEmployee/${selectedEmployee.employeeId}`, selectedEmployee)
            .then(() => {
                window.showToast("Employee information successfully modified.");
                setShowModifyModal(false);
                pageEmployeesN(page);
            })
            .catch(error => {
                console.error('Error occurred during modification:', error);
                window.showToast('An error occurred while modifying employee information.', 'error');
            });
    };

    // Modify selected employee's information
    const handleEmployeeChange = (field, value) => {
        setSelectedEmployee(prevEmployee => ({
            ...prevEmployee,
            [field]: value
        }));
    };

    // Delete (soft) from modify modal
    const handleDelete = () => {
        window.confirmCustom("Do you really want to delete?").then(result => {
            if (result) {
                if (selectedEmployee) {
                    axios.put(`/api/deleteEmployee/${selectedEmployee.employeeId}`)
                        .then(response => {
                            window.showToast('Employee has been deleted.');
                            closeModifyModal();
                            pageEmployeesN(1);  // Refresh active employee list after deletion
                        })
                        .catch(error => {
                            console.error('Error occurred during deletion:', error);
                            window.showToast('An error occurred while deleting employee.', 'error');
                        });
                }
            }
        });
    };

    //////////////////From here is registration modal////////////////////////////////////////////////

    // Registration modal
    const openInsertModal = () => {
        setNewEmployee({
            employeeId: '',
            employeePw: '',
            employeeName: '',
            employeeEmail: '',
            employeeTel: '',
            employeeRole: ''
        });
        setShowInsertModal(true);
    };

    // Close registration modal
    const closeInsertModal = () => {
        setShowInsertModal(false);
    };

    // 🟢 Close window when modal background is clicked (registration)
    const handleInsertBackgroundClick = (e) => {
        if (e.target.className === 'modal_overlay') {
            closeInsertModal();
        }
    };

    // Employee registration (duplicate check when button is pressed)
    const InsertSubmit = () => {

        if (newEmployee.employeeRole === '') {
            window.showToast('Please select a role.', 'error');
            return;
        }

        if (!validateEmployeeData(newEmployee)) {
            return;
        }

        axios.get('/api/checkEmployeeId', { params: { employeeId: newEmployee.employeeId } })
            .then(response => {
                if (response.data) {

                    window.showToast('This ID already exists.', 'error');
                } else {

                    axios.post('/api/registerEmployee', newEmployee)
                        .then(response => {
                            window.showToast('Employee registration completed.');
                            closeInsertModal();
                            setNewEmployee({
                                employeeId: '',
                                employeePw: '',
                                employeeName: '',
                                employeeEmail: '',
                                employeeTel: '',
                                employeeRole: ''
                            });
                            pageEmployeesN(1); // Refresh to first page
                        })
                        .catch(error => {
                            console.error('Error occurred: ', error);
                            window.showToast('Error occurred during employee registration', 'error');
                        });
                }
            })
            .catch(error => {
                console.error('Error occurred during ID duplicate check:', error);
                window.showToast('An error occurred during ID duplicate check.', 'error');
            });
    };

    // Validation (used for both registration and modification)
    const validateEmployeeData = (employeeData) => {
        const phoneRegex = /^\d{3}-\d{4}-\d{4}$/; // 000-0000-0000 format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // xxx@xxx.xxx format
        const allowedRoles = ['admin', 'staff', 'manager'];

        if (!phoneRegex.test(employeeData.employeeTel)) {
            window.showToast('Please enter phone number in 000-0000-0000 format.', 'error');
            return false;
        }

        if (!emailRegex.test(employeeData.employeeEmail)) {
            window.showToast('Please enter a valid email format.', 'error');
            return false;
        }

        //        if (!allowedRoles.includes(employeeData.employeeRole.toLowerCase())) {
        //            window.showToast('Role must be one of: admin, staff, manager.');
        //            return false;
        //        }


        return true;
    };

    // Common function for search term delete button click
    const handleSearchDel = (setSearch) => {
        setSearch(''); // Commonly set state to ''
    };

    // 🟣 Rendering
    return (
        <Layout currentMenu="employee"> {/* Layout component, currentMenu indicates the currently selected menu */}
            <main className="main-content menu_employee">
                <div className="menu_title">
                    <div className="sub_title">Employee Management</div>
                    <div className="main_title">Employee List</div>
                </div>
                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            <div className={`search_box ${searchEmployee ? 'has_text' : ''}`}>
                                <label className={`label_floating ${searchEmployee ? 'active' : ''}`}>Enter name</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={searchEmployee}
                                    onChange={(e) => setSearchEmployee(e.target.value)}
                                />
                                {/* Search term delete button */}
                                {searchEmployee && (
                                    <button
                                        className="btn-del"
                                        onClick={() => handleSearchDel(setSearchEmployee)} // Use common function
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
                                    value="allEmployees"
                                    checked={currentView === 'allEmployees'}
                                    onClick={() => { setCurrentView('allEmployees'); setPage(1); pageAllEmployees(1); }}
                                />
                                <label htmlFor="all">All</label>
                                <input
                                    type="radio"
                                    id="active"
                                    name="filterType"
                                    value="employeesN"
                                    checked={currentView === 'employeesN'}
                                    onClick={() => { setCurrentView('employeesN'); setPage(1); pageEmployeesN(1); }}
                                />
                                <label htmlFor="active">Active</label>
                                <input
                                    type="radio"
                                    id="deleted"
                                    name="filterType"
                                    value="employeesY"
                                    checked={currentView === 'employeesY'}
                                    onClick={() => { setCurrentView('employeesY'); setPage(1); pageEmployeesY(1); }}
                                />
                                <label htmlFor="deleted">Deleted</label>
                            </div>
                        </div>
                        <div className="right">
                            <button className="box color" onClick={openInsertModal}><i className="bi bi-plus-circle"></i> Register</button>
                        </div>
                    </div>
                    <div className="table_wrap">
                        <table>
                            <thead>
                            <tr>
                                {/* Select all checkbox */}
                                <th>
                                    <label className="chkbox_label">
                                        <input
                                            type="checkbox" className="chkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                        <i className="chkbox_icon">
                                            <i className="bi bi-check-lg"></i>
                                        </i>
                                    </label>
                                </th>
                                <th>No.</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                {/*<th>Email</th>*/}
                                <th>Role</th>
                                <th>Registration Date</th>
                                <th>Modified Date</th>
                                <th>Deleted Date</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr className="tr_empty">
                                    <td colSpan="10"> {/* Center align loading animation */}
                                        <div className="loading">
                                            <span></span> {/* First circle */}
                                            <span></span> {/* Second circle */}
                                            <span></span> {/* Third circle */}
                                        </div>
                                    </td>
                                </tr>
                            ) : (searchEmployee ? filteredEmployees : employees).length === 0 ? (
                                // Display tr_empty when no results found
                                <tr className="tr_empty">
                                    <td colSpan="10">
                                        <div className="no_data">
                                            <i className="bi bi-exclamation-triangle"></i>
                                            No results found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Display employee list
                                (searchEmployee ? filteredEmployees : employees).map((employee, index) => (
                                    <tr key={employee.employeeId}
                                        className={
                                            selectedEmployees[index]
                                                ? ('selected_row')  // Selected row
                                                : ''
                                        }
                                    >
                                        <td>
                                            {/* Conditional rendering based on deleted status and admin check */}
                                            {employee.employeeDeleteYn !== 'Y' ? (
                                                employee.employeeId === 'admin' ? (
                                                    <i class="bi bi-pin-angle-fill"></i>
                                                ) : (
                                                    <label className="chkbox_label">
                                                        <input
                                                            type="checkbox"
                                                            className="chkbox"
                                                            checked={selectedEmployees[index] || false}
                                                            onChange={() => handleSelect(index)}
                                                        />
                                                        <i className="chkbox_icon">
                                                            <i className="bi bi-check-lg"></i>
                                                        </i>
                                                    </label>
                                                )
                                            ) : (
                                                <span className="label_del">Deleted</span>
                                            )}

                                        </td>
                                        <td>{(page - 1) * 20 + index + 1}</td>
                                        <td>{employee.employeeId}</td>
                                        <td>{employee.employeeName}</td>
                                        <td>{employee.employeeTel}</td>
                                        <td>
                                            {/* Apply different label levels based on employeeRole */}
                                            {employee.employeeRole === 'admin' && (
                                                <span className="label_level level-1">admin</span>
                                            )}
                                            {employee.employeeRole === 'manager' && (
                                                <span className="label_level level-2">manager</span>
                                            )}
                                            {employee.employeeRole === 'staff' && (
                                                <span className="label_level level-3">staff</span>
                                            )}
                                        </td>
                                        <td>{employee.employeeInsertDate ? format(employee.employeeInsertDate, 'yyyy-MM-dd HH:mm') : '-'}</td>
                                        <td>{employee.employeeUpdateDate ? format(employee.employeeUpdateDate, 'yyyy-MM-dd HH:mm') : '-'}</td>
                                        <td>{employee.employeeDeleteDate ? format(employee.employeeDeleteDate, 'yyyy-MM-dd HH:mm') : '-'}</td>
                                        <td>
                                            {/* Apply click event and style based on deleted status */}
                                            <div className="btn_group">
                                                <button
                                                    className="box small"
                                                    onClick={employee.employeeDeleteYn !== 'Y' ? () => openModifyModal(employee) : null}
                                                    style={{
                                                        opacity: employee.employeeDeleteYn === 'Y' ? 0 : 1,
                                                        cursor: employee.employeeDeleteYn === 'Y' ? 'default' : 'pointer'
                                                    }}
                                                >
                                                    Modify
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination-container">
                        <div className="pagination-sub left">
                            <button className="box" onClick={checkedDelete}><i className="bi bi-trash3"></i>Delete Selected</button>
                        </div>

                        {/* Center: Pagination */}
                        <div className="pagination">
                            {/* 'First' button */}
                            {page > 1 && (
                                <button className="box icon first" onClick={() => PageChange(1)}>
                                    <i className="bi bi-chevron-double-left"></i>
                                </button>
                            )}

                            {/* 'Previous' button */}
                            {page > 1 && (
                                <button className="box icon left" onClick={() => PageChange(page - 1)}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                            )}

                            {/* Page number block */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const startPage = Math.floor((page - 1) / 5) * 5 + 1;
                                const currentPage = startPage + index; // Changed to currentPage instead of page
                                return (
                                    currentPage <= totalPages && (
                                        <button
                                            key={currentPage}
                                            onClick={() => PageChange(currentPage)}
                                            className={currentPage === page ? 'box active' : 'box'} // Use currentPage instead of page in comparison
                                        >
                                            {currentPage}
                                        </button>
                                    )
                                );
                            })}

                            {/* 'Next' button */}
                            {page < totalPages && (
                                <button className="box icon right" onClick={() => PageChange(page + 1)}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            )}

                            {/* 'Last' button */}
                            {page < totalPages && (
                                <button className="box icon last" onClick={() => PageChange(totalPages)}>
                                    <i className="bi bi-chevron-double-right"></i>
                                </button>
                            )}
                        </div>

                        <div className="pagination-sub right"></div>
                    </div>
                </div>
            </main>

            {showModifyModal && (
                <div className="modal_overlay" onMouseDown={handleModifyBackgroundClick}>
                    <div className='modal_container edit'>
                        <div className="header">
                            <div>Modify Employee Information</div>
                            <button className="btn_close" onClick={closeModifyModal}><i className="bi bi-x-lg"></i></button> {/* Close modal button */}
                        </div>
                        <div className="edit_wrap">
                            <div className='edit_form'>
                                <div className='field_wrap'>
                                    <label>ID</label>
                                    <input
                                        type='text'
                                        className='box disabled'
                                        value={selectedEmployee.employeeId}
                                        disabled
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Password</label>
                                    <input
                                        type='password'
                                        className='box'
                                        placeholder='Please enter password'
                                        value={selectedEmployee.employeePw}
                                        onChange={(e) => handleEmployeeChange('employeePw', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Name</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='Please enter name'
                                        value={selectedEmployee.employeeName}
                                        onChange={(e) => handleEmployeeChange('employeeName', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Email</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='Please enter email'
                                        value={selectedEmployee.employeeEmail}
                                        onChange={(e) => handleEmployeeChange('employeeEmail', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Phone</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='Please enter phone number'
                                        value={selectedEmployee.employeeTel}
                                        onChange={(e) => handleEmployeeChange('employeeTel', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Role</label>
                                    <select
                                        className='box'
                                        value={selectedEmployee.employeeRole}
                                        onChange={(e) => handleEmployeeChange('employeeRole', e.target.value)}
                                    >
                                        <option value="">Please select a role</option>
                                        <option value="admin">admin</option>
                                        <option value="staff">staff</option>
                                        <option value="manager">manager</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="box blue" onClick={handleModifySubmit}>Modify</button>
                                <button className="box red" onClick={handleDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showInsertModal && (
                <div className="modal_overlay" onMouseDown={handleInsertBackgroundClick}>
                    <div className='modal_container edit'>
                        <div className="header">
                            <div>Register Employee Information</div>
                            <button className="btn_close" onClick={closeInsertModal}><i className="bi bi-x-lg"></i></button> {/* Close modal button */}
                        </div>
                        <div className="edit_wrap">
                            <div className='edit_form'>
                                <div className='field_wrap'>
                                    <label>ID</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='Please enter ID'
                                        value={newEmployee.employeeId}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Password</label>
                                    <input
                                        type='password'
                                        className='box'
                                        placeholder='Please enter password'
                                        value={newEmployee.employeePw}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeePw: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Name</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='Please enter name'
                                        value={newEmployee.employeeName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeName: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Email</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='Please enter email'
                                        value={newEmployee.employeeEmail}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeEmail: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Phone</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='Please enter phone number'
                                        value={newEmployee.employeeTel}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeTel: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>Role</label>
                                    <select
                                        className='box'
                                        value={newEmployee.employeeRole}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeRole: e.target.value })}
                                    >
                                        <option value="">Please select a role</option>
                                        <option value="admin">admin</option>
                                        <option value="staff">staff</option>
                                        <option value="manager">manager</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="box blue" onClick={InsertSubmit}>Register</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

// Root page JS is processed to be inserted into root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <EmployeeList />
    </BrowserRouter>
);