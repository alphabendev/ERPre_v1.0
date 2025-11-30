import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useSearchParams } from "react-router-dom";
import Layout from "../../layout/Layout";
import '../../../resources/static/css/sales/OrderList.css';

const fetchOrders = async () => {
    try {
        const response = await fetch('/api/order/all');
        if (!response.ok) {
            throw new Error('Network connection is unstable.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
};

const fetchEmployee = async () => {
    try {
        const response = await fetch('/api/employee', {
            credentials: "include", // Include session
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to fetch user information.');
            return null;
        }
    } catch (error) {
        console.error('Error occurred while fetching user information:', error);
        return null;
    }
};

const updateOrderStatus = async (orderNo) => {
    try {
        const response = await fetch(`/api/order/updateStatus/${orderNo}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderHStatus: 'approved' }),
        });
        if (response.ok) {
            console.log("approved success");
            return true;
        } else {
            throw new Error('Order status update failed');
        }
    } catch (error) {
        console.error('Error occurred while updating order status');
        return false;
    }
};


const deniedOrderStatus = async (orderNo) => {
    try {
        const response = await fetch(`/api/order/updateStatus/${orderNo}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderHStatus: 'denied' }),
        });
        if (response.ok) {
            console.log("denied success");
            return true;
        } else {
            throw new Error('Order status update failed');
        }
    } catch (error) {
        console.error('Error occurred while updating order status');
        return false;

    }
};


function OrderList() {
    const [filterValue, setFilterValue] = useState('');
    const [filter, setFilter] = useState('');
    const [filterType, setFilterType] = useState('customer');
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [role, setRole] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState(''); // Status
    const [pageInputValue, setPageInputValue] = useState('1'); // Page input value
    const [startDate, setStartDate] = useState(''); // Start date
    const [endDate, setEndDate] = useState(''); // End date
    const [selectedOrders, setSelectedOrders] = useState(new Set()); // Set of checked order numbers
    const [allSelected, setAllSelected] = useState(false); // Select all checkbox state
    const [itsAssignedMode, setItsAssignedMode] = useState(false);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'Assigned') {
            setItsAssignedMode(true);
        } else {
            setItsAssignedMode(false);
        }
    }, [searchParams])

    // useEffect(() => {
    //     if (itsAssignedMode) {
    //         setSelectedStatus('Under Approval');
    //         applyFilter('Under Approval');
    //     }
    // }, [itsAssignedMode]);



    const applyFilter = (filterValue) => {
        setFilter(filterValue);
        setFilterType("status");
        setSearchTerm('');
        setCurrentPage(1);
    };


    const handleStatusChange = (event) => {
        const status = event.target.value;
        setSelectedStatus(status);
        applyFilter(status);
    };

    const mapStatusFromDbToUi = (dbStatus) => {
        switch (dbStatus) {
            case 'ing':
                return 'Under Approval';
            case 'approved':
                return 'Approved';
            case 'denied':
                return 'Rejected';
            default:
                return 'Unknown';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get employee information
                const empData = await fetchEmployee();
                if (empData) {
                    setRole(empData.employeeRole);
                    setEmployeeId(empData.employeeId);

                    // Permission check for Assigned mode
                    if (itsAssignedMode && empData.employeeRole !== 'admin') {
                        window.showToast('No access permission for this page.', 'error');
                        setTimeout(() => {
                            window.location.href = '/main'; // Redirect unauthorized users to main page
                        }, 1000); // 1000 milliseconds
                        return;
                    }

                }
                // Get order information
                const orderData = await fetchOrders();

                // Filter orders
                if (empData.employeeRole === 'admin') {
                    setOrders(orderData); // Show all orders for admin
                } else {
                    const filteredOrders = orderData.filter(order => order.employee.employeeId === empData.employeeId);
                    setOrders(filteredOrders);
                }
            } catch (err) {
                window.showToast('No access permission for this page.', 'error');
                setTimeout(() => {
                    window.location.href = '/main';
                }, 1000); // 1000 milliseconds
            } finally {
                setLoading(false); // Data loading completed
            }
        };
        fetchData();
        // Set current date as default
        const today = new Date();
        today.setHours(today.getHours() + 9); // Add 9 hours to UTC time (Korea time)
        const formattedToday = today.toISOString().split('T')[0];
        setEndDate(formattedToday);
    }, [itsAssignedMode]);


    useEffect(() => {
        if (Array.isArray(filteredOrders)) {
            // Update select all checkbox state
            const ingOrders = filteredOrders.filter(order => order.orderHStatus === 'ing');
            const isAllSelected = ingOrders.length > 0 && ingOrders.every(order => selectedOrders.has(order.orderNo));
            setAllSelected(isAllSelected);
        } else {
            setAllSelected(false);
        }
    }, [selectedOrders, filteredOrders]);

    // Sort filtered orders by registration date in descending order
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.orderHInsertDate);
        const dateB = new Date(b.orderHInsertDate);
        return dateB - dateA; // Descending order sort
    });

    const filteredOrders = sortedOrders.filter(order => {
        const customerName = order.customer?.customerName || '';
        const orderDate = order.orderHInsertDate?.split('T')[0] || '';
        const orderStatus = mapStatusFromDbToUi(order.orderHStatus) || '';
        const productNames = (order.productNames || []).join(', ');
        const employeeName = order.employee?.employeeName || '';

        const matchesFilter = filterType === 'customer' ? customerName.includes(filter) :
            filterType === 'date' ? orderDate.includes(filter) :
                filterType === 'status' ? orderStatus.includes(filter) :
                    filterType === 'items' ? productNames.includes(filter) :
                        filterType === 'employee' ? employeeName.includes(filter) :
                            true;

        const matchesSearch = searchTerm ? [customerName, orderDate, orderStatus, productNames, employeeName].some(field => field.includes(searchTerm)) : true;

        const orderDateObj = new Date(order.orderHInsertDate.split('T')[0]);

        const isDateInRange = (!startDate || orderDateObj >= new Date(startDate)) &&
            (!endDate || orderDateObj <= new Date(endDate));

        return matchesFilter && matchesSearch && isDateInRange;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const formatProductNames = (productNames) => {
        if (!Array.isArray(productNames)) return 'N/A';
        if (productNames.length <= 1) {
            return productNames.join(', ');
        } else {
            return `${productNames[0]} and ${productNames.length - 1} more`;
        }
    };

    const handleItemsPerPageChange = (event) => {
        const value = Number(event.target.value);
        if (value > 0 && value <= 100) {
            setItemsPerPage(value);
            setCurrentPage(1); // Reset page number
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        setPageInputValue(pageNumber.toString()); // Update page input value
    };

    const handlePageInputChange = (event) => {
        const value = event.target.value;
        if (/^\d*$/.test(value)) { // Only allow numbers
            const pageNumber = Number(value);
            if (pageNumber >= 1 && pageNumber <= totalPages) {
                setPageInputValue(value);
                setCurrentPage(pageNumber);
            } else if (value === '') { // When input is empty
                setPageInputValue(value);
            }
        }
    };

    const handleCheckboxChange = (orderNo) => {
        setSelectedOrders(prev => {
            const newSelectedOrders = new Set(prev);
            if (newSelectedOrders.has(orderNo)) {
                newSelectedOrders.delete(orderNo);
            } else {
                newSelectedOrders.add(orderNo);
            }
            return newSelectedOrders;
        });
    };

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            const newSelectedOrders = new Set(filteredOrders
                .filter(order => order.orderHStatus === 'ing')
                .map(order => order.orderNo));
            setSelectedOrders(newSelectedOrders);
        } else {
            setSelectedOrders(new Set());
        }
    };

    const handleDeniedSelectedOrders = async () => {

        window.confirmCustom("Do you want to reject the selected orders?").then(result => {
            if (result) {
                if (selectedOrders.size === 0) {
                    window.showToast('Please select orders to reject.', 'error');
                    return;
                }

                let successCount = 0;
                let failCount = 0;

                const orderPromises = Array.from(selectedOrders).map(orderNo => {
                    return deniedOrderStatus(orderNo)
                        .then(result => {
                            if (result) {
                                successCount++;
                            } else {
                                failCount++;
                            }
                        })
                        .catch(error => {
                            console.error('Error occurred during rejection processing:', error);
                            failCount++;
                        });
                });

                Promise.all(orderPromises).then(() => {
                    if (successCount > 0) {
                        window.showToast(`${successCount} orders have been successfully rejected.`);
                    }
                    if (failCount > 0) {
                        window.showToast(`${failCount} orders failed to be rejected.`, 'error');
                    }

                    // Reset selected orders list after rejection
                    setSelectedOrders(new Set());

                    // Refresh order list
                    fetchOrders().then(orderData => {
                        setOrders(role === 'admin' ? orderData : orderData.filter(order => order.employee.employeeId === employeeId));
                    });
                });

            }
        });

    };

    const handleApproveSelectedOrders = async () => {

        window.confirmCustom("Do you want to approve the selected orders?").then(result => {
            if (result) {
                if (selectedOrders.size === 0) {
                    window.showToast('Please select orders to approve.', 'error');
                    return;
                }

                let successCount = 0;
                let failCount = 0;

                // Execute async requests for selected orders
                const orderPromises = Array.from(selectedOrders).map(orderNo => {
                    return updateOrderStatus(orderNo)
                        .then(result => {
                            if (result) {
                                successCount++;
                            } else {
                                failCount++;
                            }
                        })
                        .catch(error => {
                            console.error('Error occurred during approval processing:', error);
                            failCount++;
                        });
                });

                // Process results after all order approvals
                Promise.all(orderPromises).then(() => {
                    if (successCount > 0) {
                        window.showToast(`${successCount} orders have been successfully approved.`);
                    }
                    if (failCount > 0) {
                        window.showToast(`${failCount} orders failed to be approved.`, 'error');
                    }

                    // Reset selected orders list after approval
                    setSelectedOrders(new Set());

                    // Refresh order list
                    fetchOrders().then(orderData => {
                        setOrders(role === 'admin' ? orderData : orderData.filter(order => order.employee.employeeId === employeeId));
                    });
                });

            }
        });

    };

    const renderPageButtons = () => {
        const pageButtons = [];
        const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
        const endPage = Math.min(startPage + 4, totalPages);

        for (let page = startPage; page <= endPage; page++) {
            pageButtons.push(
                <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={currentPage === page ? 'box active' : 'box'}
                >
                    {page}
                </button>
            );
        }

        return pageButtons;
    };

    return (
        <Layout currentMenu='orderList'>
            <main className={`main-content menu_order_list ${role === 'admin' ? 'role_admin' : 'role_normal'}`}>
                <div className="menu_title">
                    <div className="sub_title">Sales Management</div>
                    <div className="main_title">
                        {!loading ? (role === 'admin' ? 'All Orders List' : 'Assigned Orders List') : 'Order List'}
                    </div>
                </div>
                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            <select className="box" onChange={(e) => setFilterType(e.target.value)}
                                    value={filterType}>
                                <option value="customer">Customer</option>
                                <option value="date">Order Registration Date</option>
                                <option value="status">Order Status</option>
                                <option value="items">Product (Contract) List</option>
                                {role === 'admin' && (
                                    <option value="employee">Manager</option>
                                )}
                            </select>

                            <div className="search_box">
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    placeholder="Enter search term"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <br />
                            <div className="radio_box">
                                <span>Status</span>
                                {/* Show only 'Under Approval' radio button when 'itsAssignedMode' is true */}


                                <input
                                    type="radio"
                                    id="all"
                                    name="status"
                                    value=""
                                    checked={selectedStatus === ''}
                                    onChange={handleStatusChange}
                                />
                                <label htmlFor="all">All</label>

                                <input
                                    type="radio"
                                    id="pending"
                                    name="status"
                                    value="Under Approval"
                                    checked={selectedStatus === 'Under Approval'}
                                    onChange={handleStatusChange}
                                />
                                <label htmlFor="pending">Under Approval</label>

                                <input
                                    type="radio"
                                    id="completed"
                                    name="status"
                                    value="Approved"
                                    checked={selectedStatus === 'Approved'}
                                    onChange={handleStatusChange}
                                />
                                <label htmlFor="completed">Approved</label>

                                <input
                                    type="radio"
                                    id="rejected"
                                    name="status"
                                    value="Rejected"
                                    checked={selectedStatus === 'Rejected'}
                                    onChange={handleStatusChange}
                                />
                                <label htmlFor="rejected">Rejected</label>


                            </div>


                            <div className={`date_box ${startDate ? 'has_text' : ''}`}>
                                <label>Order Registration Date</label>
                                <input
                                    type="date"
                                    max="9999-12-31"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <span className="date-separator">~</span>
                            <div className={`date_box ${endDate ? 'has_text' : ''}`} style={{ padding: '0' }}>
                                <input
                                    type="date"
                                    max="9999-12-31"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                        </div>

                        <div className="right">
                            {itsAssignedMode && role === 'admin' && (
                                <>
                                    <button className="box color" onClick={handleApproveSelectedOrders}>
                                        Approve
                                    </button>
                                    <button className="box" onClick={handleDeniedSelectedOrders}>
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="table_wrap">
                        <table>
                            <thead>
                            <tr>
                                {itsAssignedMode && role === 'admin' && (
                                    <th className="checkbox-input">
                                        <label className="chkbox_label">
                                            <input
                                                type="checkbox"
                                                className="chkbox"
                                                checked={allSelected}
                                                onChange={handleSelectAll}
                                            />
                                            <i className="chkbox_icon">
                                                <i className="bi bi-check-lg"></i>
                                            </i>
                                        </label>
                                    </th>
                                )}
                                <th>Order Number</th>
                                <th>Customer</th>
                                <th>Order Registration Date</th>
                                <th>Order Status</th>
                                <th>Product (Contract) List</th>
                                <th>Total Amount (KRW)</th>
                                <th>Manager Name</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {/* Show loading animation when loading */}
                            {loading ? (
                                <tr className="tr_empty">
                                    <td colSpan={role === 'admin' ? 10 : 9}> {/* Determine colSpan based on admin status */}
                                        <div className="loading">
                                            <span></span> {/* First circle */}
                                            <span></span> {/* Second circle */}
                                            <span></span> {/* Third circle */}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (  // Handle when no data
                                <tr className="tr_empty">
                                    <td colSpan={role === 'admin' ? 10 : 9}>
                                        <div className="no_data"><i className="bi bi-exclamation-triangle"></i>No results found.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map(order => (
                                        <tr key={order.orderNo}
                                            className={
                                                selectedOrders.has(order.orderNo)
                                                    ? ('selected_row')  // Selected row
                                                    : ''
                                            }
                                        >
                                            {itsAssignedMode && role === 'admin' && (
                                                <td className="checkbox-input">
                                                    {order.orderHStatus === 'ing' ? (
                                                        <label className="chkbox_label">
                                                            <input
                                                                type="checkbox"
                                                                className="chkbox"
                                                                checked={selectedOrders.has(order.orderNo)}
                                                                onChange={() => handleCheckboxChange(order.orderNo)}
                                                                disabled={order.orderHStatus !== 'ing'} // Disable when not ing
                                                            />
                                                            <i className="chkbox_icon">
                                                                <i className="bi bi-check-lg"></i>
                                                            </i>
                                                        </label>
                                                    ) : (
                                                        <label className="chkbox_label">
                                                            <input
                                                                type="checkbox"
                                                                className="chkbox"
                                                                checked={selectedOrders.has(order.orderNo)}
                                                                disabled
                                                            />
                                                            <i className="chkbox_icon">
                                                                <i className="bi bi-check-lg"></i>
                                                            </i>
                                                        </label>
                                                    )}
                                                </td>
                                            )}

                                            <td>{String(order.orderNo).padStart(3, '0')}</td>
                                            <td>{order.customer?.customerName || 'N/A'}</td>
                                            <td>{order.orderHInsertDate?.split('T')[0] || 'N/A'}</td>
                                            <td> <span
                                                className={`order-status ${order.orderHStatus}`}>
                                                    {mapStatusFromDbToUi(order.orderHStatus)}
                                                </span>
                                            </td>
                                            <td>{formatProductNames(order.productNames || []) || 'N/A'}</td>
                                            <td>{order.orderHTotalPrice?.toLocaleString() + ' KRW' || 'N/A'}</td>
                                            <td>{order.employee?.employeeName || 'N/A'}</td>
                                            <td>
                                                <div className="btn_group">
                                                    <button
                                                        className="box small"
                                                        onClick={() => {
                                                            window.location.href = `/order?no=${order.orderNo}`;
                                                        }}
                                                    >
                                                        View Details
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
                            <input
                                type="number"
                                id="itemsPerPage"
                                className="box"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                min={1}
                                max={100}
                                step={1}
                            />
                            <label htmlFor="itemsPerPage">items per page / <b>{filteredOrders.length}</b> items</label>
                        </div>
                        <div className="pagination">
                            {/* 'First' button */}
                            {currentPage > 1 && (
                                <button className="box icon first" onClick={() => handlePageClick(1)}>
                                    <i className="bi bi-chevron-double-left"></i>
                                </button>
                            )}


                            {/* 'Previous' button */}
                            {currentPage > 1 && (
                                <button className="box icon left" onClick={() => handlePageClick(currentPage - 1)}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                            )}

                            {/* Page number block calculation (1~5, 6~10 style) */}
                            {renderPageButtons()}

                            {/* 'Next' button */}
                            {currentPage < totalPages && (
                                <button className="box icon right" onClick={() => handlePageClick(currentPage + 1)}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            )}

                            {/* 'Last' button */}
                            {currentPage < totalPages && (
                                <button className="box icon last" onClick={() => handlePageClick(totalPages)}>
                                    <i className="bi bi-chevron-double-right"></i>
                                </button>
                            )}
                        </div>

                        {/* Right: Page number input */}
                        <div className="pagination-sub right">
                            <input
                                type="text"
                                id="pageInput"
                                className="box"
                                min={1}    // Set minimum value
                                step={1}   // Can increase/decrease by 1
                                max={totalPages}
                                value={pageInputValue} // Input value managed by state
                                onChange={handlePageInputChange}
                            />
                            <label htmlFor="pageInput">/ <b>{totalPages}</b> pages</label>
                        </div>
                    </div>

                </div>
            </main>
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <OrderList />
    </BrowserRouter>
);