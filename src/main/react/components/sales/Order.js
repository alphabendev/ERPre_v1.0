import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'; // Use ReactDOM to render React components to DOM
import { BrowserRouter, useSearchParams } from "react-router-dom"; // React routing related libraries
import Layout from "../../layout/Layout"; // Import common layout component (header, footer, etc.)
import CustomerSearchModal from '../common/CustomerSearchModal'; // Import customer search modal
import ProductSearchModal from '../common/ProductSearchModal'; // Import product search modal
import { useHooksList } from './OrderHooks'; // Hook for handling states and logic
import '../../../resources/static/css/sales/Order.css';
import { color } from 'chart.js/helpers';



function Order() {

    // 🔴 Customer search, product search
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({ customerName: 'Select Customer', customerNo: '' });
    const [selectedProduct, setSelectedProduct] = useState({ productNm: 'Select Product', productCd: '', productPrice: 0 });


    // 🔴🔴🔴🔴 Close modal and set button value when customer is selected
    const handleCustomerSelect = (selectedCustomer) => {
        console.log('Selected customer:', selectedCustomer);

        setCustomerData({
            customerNo: selectedCustomer.customerNo,
            customerName: selectedCustomer.customerName,
            customerAddr: selectedCustomer.customerAddr,
            customerTel: selectedCustomer.customerTel,
            customerRepresentativeName: selectedCustomer.customerRepresentativeName
        });
        setCustomerModalOpen(false);
    };

    // 🔴🔴🔴🔴 Close modal and set value when product is selected
    const handleProductSelect = (selectedProduct) => {

        if (selectedProductIndex !== null) {

            if (isEditMode || isResubmitMode) {
                const updatedOrderDetails = [...orderDetails];
                updatedOrderDetails[selectedProductIndex] = {
                    ...updatedOrderDetails[selectedProductIndex],
                    productNm: selectedProduct.productNm || '', // Update product name
                    orderDPrice: selectedProduct.priceCustomer || 0, // Update price
                    orderDQty: selectedProduct.quantity || 0,
                    productCd: selectedProduct.productCd || '', // Product code
                    priceCustomer: selectedProduct.priceCustomer || '' // Product price
                };

                setOrderDetails(updatedOrderDetails);

            } else {

                const updatedProducts = [...products];
                // Replace null fields of selected product with default value 0
                updatedProducts[selectedProductIndex] = {
                    ...selectedProduct,
                    name: selectedProduct.productNm,
                    // price: selectedProduct.price || 0,
                    price: selectedProduct.priceCustomer || 0,
                    quantity: selectedProduct.quantity || 0,
                    code: selectedProduct.productCd // Add product code
                };
                setProducts(updatedProducts);

            }

        } else {
            console.error('handleProductSelect error');
        }
        setProductModalOpen(false);
    };

    // 🔴🔴🔴🔴
    const openProductModal = (index) => {
        // Execute necessary states and functions before opening modal
        setSelectedProductIndex(index); // Set index of selected product

        // Open modal
        setProductModalOpen(true);
    };

    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);


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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const empData = await fetchEmployee();
                if (empData) {
                    setRole(empData.employeeRole);
                }
            } catch (err) {
                window.showToast('No access permission for this page.', 'error');
                setTimeout(() => {
                    window.location.href = '/main';
                }, 1000); // 1000 milliseconds
            } finally {
            }
        };
        fetchData();
    }, []);


    const updateOrderStatus = async (orderNo, status, message) => {


        try {
            const response = await fetch(`/api/order/updateStatus/${orderNo}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderHStatus: status }),
            });
            if (response.ok) {
                console.log("orderstatus update success");
                return true;
            } else {
                throw new Error('Order status update failed');
            }
        } catch (error) {
            console.error('Error occurred while updating order status');
            return false;
        }
    };

    const handleApproveOrder = async () => {
        try {

            window.confirmCustom("Do you want to approve this order?<br>This decision cannot be reversed.").then(result => {
                if (result) {
                    const result = updateOrderStatus(orderNo, 'approved');

                    if (result) {
                        window.showToast("Order approval completed successfully.");
                        window.location.reload();
                    } else {
                        throw new Error("Error occurred during order approval");
                    }
                }
            });

        } catch (error) {
            window.showToast('Order approval failed. Please contact administrator', 'error');
        }
    };

    const handleDeniedOrder = async () => {
        try {
            window.confirmCustom(`Do you want to reject this order?<br>This decision cannot be reversed.`).then(result => {
                if (result) {
                    const result = updateOrderStatus(orderNo, 'denied');

                    if (result) {
                        window.showToast("Order rejection completed successfully.");
                        window.location.reload();
                    } else {
                        throw new Error('Error occurred during order rejection');
                    }
                }
            });

        } catch (error) {
            window.showToast("Order rejection failed. Please contact administrator", 'error');
        }
    };

    // 🔴 Get states and functions through custom hook
    const {
        // Order mode related states
        isCreateMode,  // Check if current order is in registration mode
        isEditMode,    // Check if current order is in edit mode
        isDetailView,  // Check if current order is in detail view mode
        isResubmitMode, // Check if rejected order is being registered in edit mode

        // Order number related states
        orderNo,       // Current order number


        // Order related data and states
        products,           // Product list
        customerData,       // Customer information
        orderDetails,       // Order detail information
        orderHStatus,
        orderHTotalPrice,   // Order total amount
        orderHInsertDate,   // Order registration date
        employee,           // Manager information (logged in user information)

        // Product and order detail data change functions
        handleProductChange,    // Product data change handling function (during registration)
        handleProductEdit,      // Product edit data change handling function (during edit)
        addProductRow,          // Add product row function
        removeProductRow,       // Remove product row function
        removeProducteditRow,   // Remove product edit row function

        // Order creation and edit functions
        handleSubmit,   // Order creation handling function
        handleEdit,     // Order edit handling function
        handleResubmit,

        // Date related functions
        formatDateForInput,  // Function to convert date to yyyy-mm-dd format

        displayItems,
        editProductRow,
        displayItemEdit,
        setCustomerData,
        selectedProductIndex,
        setProducts,
        setOrderDetails,
        setSelectedProductIndex,
    } = useHooksList();

    return (
        <Layout currentMenu="order">
            <main className="main-content menu_order">
                <div className="menu_title">
                    <div className="sub_title">Sales Management</div>
                    <div className="main_title">{isCreateMode ? 'Order Registration' : isEditMode || isResubmitMode ? 'Order Edit' : 'Order Detail'}</div>
                </div>
                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            <div className="form-row">
                                {orderNo && !isResubmitMode && (
                                    <div className="form-group">
                                        <label>Order Number</label>
                                        <input type="text" value={orderNo} readOnly className="box readonly" />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Customer<span style={{ color: 'red', marginLeft: '1px' }}>*</span></label>
                                    <input type="hidden" className="box" name="customerNo" value={customerData.customerNo} readOnly />
                                    {/*Above is order creation, below is edit and change*/}
                                    <input type="text" className="box" name="customerName" value={customerData.customerName || ''}
                                           placeholder="Select Customer" readOnly />
                                    <button
                                        className="search-button"
                                        onClick={() => setCustomerModalOpen(true)}
                                        style={{ display: !isEditMode && !isCreateMode && !isResubmitMode ? 'none' : 'block' }}
                                    >
                                        <i className="bi bi-search"></i>
                                    </button>
                                </div>

                                {!isCreateMode && !isResubmitMode && (
                                    <>
                                        <div className="form-group">
                                            <label>Total Amount</label>
                                            <span className="orderHtotal-price"> {orderHTotalPrice.toLocaleString()} KRW</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Order Registration Date</label>
                                            <input type="date" value={formatDateForInput(orderHInsertDate) || ''} readOnly
                                                   className="readonly box"
                                            />

                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    {/*Above is order creation, below is edit and change*/}
                                    <label>Delivery Request Date<span style={{ color: 'red', marginLeft: '1px' }}>*</span></label>
                                    <input
                                        type="date"
                                        className="delivery-date box"
                                        defaultValue={formatDateForInput(orderDetails[0]?.orderDDeliveryRequestDate)}
                                        readOnly={isDetailView}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            const selectedDate = new Date(e.target.value);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0); // Set time part of today's date to 00:00:00
                                            // Date validation
                                            if (isNaN(selectedDate.getTime())) {
                                                // Handle invalid date
                                                window.showToast("Invalid date.", 'error');
                                            } else if (selectedDate < today) {
                                                // Check if selected date is before today
                                                window.showToast("Delivery request date must be equal to or after today.", 'error');
                                                e.target.value = ''; // Reset input value when wrong date is selected
                                            } else {
                                                // When selected date is valid
                                                console.log("Selected date:", selectedDate);
                                            }
                                        }
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ opacity: isCreateMode ? 0 : 1 }} >Manager</label>
                                    <span className="employee-id" style={{ display: 'none' }}>{employee ? (
                                        <>
                                            {employee.employeeId}
                                        </>
                                    ) : (
                                        'LOADING'
                                    )}</span>

                                    <span className="employee-name" style={{ display: 'none' }} >{employee ? (
                                        <>
                                            {employee.employeeName}
                                        </>
                                    ) : (
                                        <span></span>
                                    )}
                                    </span>

                                    <span className="employee-name">
                                        {employee ? (
                                            <input
                                                type="text"
                                                className="employee-name box"
                                                value={employee.employeeName}
                                                readOnly
                                                style={{ opacity: isCreateMode ? 0 : 1 }}
                                            />
                                        ) : (
                                            <span>NOT AVAILABLE</span> // Provide alternative text when employee is not available
                                        )}
                                    </span>

                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input type="text" className="box" name="customerAddrx" value={customerData.customerAddr || ''}
                                           placeholder="Select Customer" readOnly />
                                </div>

                                <div className="form-group">
                                    <label>Contact</label>
                                    <input type="text" className="box" name="customerTel" value={customerData.customerTel || ''}
                                           placeholder="Select Customer" readOnly />
                                </div>

                                <div className="form-group">
                                    <label>Representative Name</label>
                                    <input type="text" className="box" name="customerRepresentativeName"
                                           value={customerData.customerRepresentativeName || ''}
                                           placeholder="Select Customer" readOnly />
                                </div>

                                {!isCreateMode && !isResubmitMode && (
                                    <div className="form-group">

                                        <label>Current Order Status</label>
                                        <span className={`order-status ${orderHStatus}`}>
                                            {/* Change text to Korean according to status */}
                                            {orderHStatus === 'ing' && 'Under Approval'}
                                            {orderHStatus === 'denied' && 'Rejected'}
                                            {orderHStatus === 'approved' && 'Approved'}
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>
                        <div className="right">
                            {/* Product add button - only shown in creation mode or edit mode (recreation mode) */}
                            {(isCreateMode || isEditMode || isResubmitMode) &&
                                customerData.customerName &&
                                orderHStatus !== 'approved' &&
                                ((isResubmitMode && orderHStatus === 'denied') || orderHStatus !== 'denied') && (
                                    <button className="box color" onClick={isCreateMode ? addProductRow : editProductRow}>
                                        <i className="bi bi-plus-circle"></i> Add New
                                    </button>
                                )}
                        </div>
                    </div>
                    <div className="table_wrap">
                        {/*SPA implementation by detail edit creation Mode*/}
                        <table className="styled-table">
                            <thead>
                            <tr>
                                <th>Product No.</th>
                                <th>Product Name</th>
                                <th>Unit Price</th>
                                <th>Quantity</th>
                                <th>Total Amount</th>
                                {(isCreateMode || isEditMode || isResubmitMode) && <th style={{ width: '100px' }}>Delete</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {/* Use one data source according to conditions */}
                            {customerData.customerName ? (
                                (isCreateMode ? products : isEditMode || isResubmitMode ? displayItemEdit : displayItems || []).map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="box"
                                                value={isCreateMode
                                                    ? item?.name || ''
                                                    : isEditMode || isResubmitMode || isDetailView
                                                        ? item?.productNm || ''
                                                        : ''}
                                                readOnly
                                                disabled={isDetailView} // Add disabled attribute in detail view mode
                                                placeholder="Select Product"
                                                onChange={(e) => {
                                                    if (isCreateMode) {
                                                        handleProductChange(index, 'name', e.target.value);
                                                    } else {
                                                        handleProductEdit(index, 'productNm', e.target.value);
                                                    }
                                                }}
                                            />
                                            {(isCreateMode || isEditMode || isResubmitMode) && (
                                                <button className="search-button" onClick={() => openProductModal(index)}>
                                                    <i className="bi bi-search"></i>
                                                </button>
                                            )}

                                        </td>
                                        <td>
                                            <input
                                                type="text" // Change type to text to handle comma-separated values
                                                className="box"
                                                value={isCreateMode
                                                    ? (item?.price !== undefined ? item.price.toLocaleString() : '')
                                                    : isEditMode || isResubmitMode
                                                        ? (item?.orderDPrice !== undefined ? item.orderDPrice.toLocaleString() : '')
                                                        : item?.orderDPrice?.toLocaleString() || ''}
                                                readOnly={!isEditMode && !isResubmitMode && !isCreateMode}
                                                disabled={isDetailView} // Add disabled attribute in detail view mode
                                                placeholder="Enter unit price"
                                                onChange={(e) => {
                                                    // Extract only numbers with commas removed
                                                    const numericValue = Number(e.target.value.replace(/,/g, ''));

                                                    if (isCreateMode) {
                                                        handleProductChange(index, 'price', numericValue);
                                                    } else if (isEditMode || isResubmitMode) {
                                                        handleProductEdit(index, 'orderDPrice', numericValue);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text" // Change type to text to handle comma-separated values
                                                className="box"
                                                value={isCreateMode
                                                    ? (item?.quantity !== undefined ? item.quantity.toLocaleString() : 0)
                                                    : isEditMode || isResubmitMode
                                                        ? (item?.orderDQty !== undefined ? item.orderDQty.toLocaleString() : 0)
                                                        : item?.orderDQty?.toLocaleString() || 0}
                                                readOnly={!isEditMode && !isResubmitMode && !isCreateMode}
                                                disabled={isDetailView} // Add disabled attribute in detail view mode
                                                placeholder="Enter quantity"
                                                onChange={(e) => {
                                                    // Extract only numbers with commas removed
                                                    const numericValue = Number(e.target.value.replace(/,/g, ''));

                                                    // Update state: save numbers without commas to state
                                                    if (isCreateMode) {
                                                        handleProductChange(index, 'quantity', numericValue);
                                                    } else if (isEditMode || isResubmitMode) {
                                                        handleProductEdit(index, 'orderDQty', numericValue);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>
                                            {((isCreateMode ? (item?.price || 0) * (item?.quantity || 0) : item?.orderDPrice * item?.orderDQty) || 0).toLocaleString()}
                                        </td>
                                        {(isCreateMode || isEditMode || isResubmitMode) && (
                                            <td style={{ width: '100px' }}>
                                                <button className="box icon del" onClick={() => {
                                                    const currentProducts = isCreateMode ? products : isEditMode || isResubmitMode ? displayItemEdit : displayItems || [];
                                                    // Show alert when no products
                                                    if (currentProducts.length > 1) {
                                                        if (isCreateMode) {
                                                            console.log("Creation mode");
                                                            removeProductRow(index);
                                                        } else if (isEditMode || isResubmitMode) {
                                                            console.log("Edit mode");
                                                            removeProducteditRow(index);
                                                        }
                                                    } else {
                                                        window.showToast("At least 1 product is required.", 'error');
                                                    }
                                                }}>
                                                    <i className="bi bi-trash"></i> {/* Delete icon */}
                                                </button>
                                            </td>
                                        )}
                                        {/* Hidden product code */}
                                        <td style={{ display: 'none' }}>
                                            <input
                                                type="text"
                                                value={isCreateMode ? item?.code : isEditMode || isResubmitMode ? item?.productCd : item?.productCd || ''}
                                                readOnly
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="tr_empty">
                                    <td colSpan="10">
                                        <div className="no_data">
                                            <i className="bi bi-exclamation-triangle"></i> Please select a customer first.
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    {customerData.customerName && (
                        <div className="table_footer_wrapper">
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', padding: '12px 8px' }}>Total Amount :
                                    <span style={{ marginLeft: "5px" }}>{(
                                        (isCreateMode ? products : isEditMode || isResubmitMode ? displayItemEdit : displayItems || [])
                                            .reduce((sum, item) => sum + (isCreateMode ? item?.price || 0 : item?.orderDPrice || 0) * (isCreateMode ? item?.quantity || 0 : item?.orderDQty || 0), 0)
                                    ).toLocaleString()} KRW</span>
                                </td>
                            </tr>
                        </div>
                    )}

                    <div className="order-buttons">
                        {isCreateMode && <button className="box color" onClick={handleSubmit}>Request Approval</button>}
                        {isResubmitMode && (
                            <button className="box color" onClick={() => handleResubmit(orderNo)}>
                                Re-request Approval
                            </button>
                        )}
                        {isEditMode && orderHStatus === 'ing' && (<button className="box color" onClick={() => handleEdit(orderNo)}>Edit Order</button>)}
                        {isDetailView && role === 'admin' && orderHStatus === 'ing' && (
                            <>
                                <button className="box color" onClick={handleApproveOrder}>
                                    Approve
                                </button>
                                <button className="box" onClick={handleDeniedOrder}>
                                    Reject
                                </button>
                            </>
                        )}
                        {isDetailView && orderHStatus === 'ing' && (
                            <button className="box color" onClick={() => window.location.href = `/order?no=${orderNo}&mode=edit`}>Edit</button>)}
                        {isDetailView && orderHStatus === 'denied' && (
                            <button className="box color" onClick={() => window.location.href = `/order?no=${orderNo}&mode=resubmit`}>Edit</button>)}
                    </div>
                </div>
            </main>
            {/* Customer search modal */}
            {isCustomerModalOpen && (
                <CustomerSearchModal
                    onClose={() => setCustomerModalOpen(false)}
                    onCustomerSelect={handleCustomerSelect}
                />
            )}
            {/* Product search modal -> Get product information for customer */}
            {isProductModalOpen && (
                <ProductSearchModal
                    onClose={() => setProductModalOpen(false)}
                    onProductSelect={handleProductSelect}
                    customerNo={customerData.customerNo || null}
                />
            )}

        </Layout >
    );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Order />
    </BrowserRouter>
);