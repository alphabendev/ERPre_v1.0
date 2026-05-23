// src/main/react/components/price/Price.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import Layout from "../../layout/Layout";
import '../../../resources/static/css/product/Price.css'; // Import individual CSS file
import { format, differenceInDays } from 'date-fns'; // Import date formatting and difference calculation functions from date-fns
import CustomerSearchModal from '../common/CustomerSearchModal'; // Import customer search modal
import ProductSearchModal from '../common/ProductSearchModal'; // Import product search modal
import Pagination from '../common/Pagination'; // Import pagination component
import { useHooksList } from './PriceHooks'; // Hook for handling price management states and logic
import PriceRow from './PriceRow'; // Import separated PriceRow component

// Component (Customer-specific product price management)
function Price() {

    // 🔴 Customer search, product search
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({ customerName: 'Select Customer', customerNo: '' });
    const [selectedProduct, setSelectedProduct] = useState({ productNm: 'Select Product', productCd: '', productPrice: 0 });

    // 🔴 Close modal and set button value when customer is selected
    const handleCustomerSelect = (customer) => {
        console.log("🔴 customer.customerName : " + customer.customerName);
        setSelectedCustomer({
            customerName: customer.customerName, // Selected customer name
            customerNo: customer.customerNo      // Selected customer number
        });
        setCustomerModalOpen(false);
    };

    // 🔴 Close modal and set button value when product is selected
    const handleProductSelect = (product) => {
        setSelectedProduct({
            productNm: product.productNm,  // Selected product name
            productCd: product.productCd,   // Selected product code
            productPrice: product.productPrice   // Selected product price
        });
        setProductModalOpen(false);
    };

    // 🔴 Registration date/time sorting function
    const handleSortClick = (field) => {
        const newOrder = sortField === field ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'asc'; // Toggle if sort field matches current field, start with ascending if not matching
        setSortField(field); // Set sort field
        setSortOrder(newOrder); // Set new sort order
    };

    // 🔴 Get states and functions through custom hook
    const {
        priceList,               // Price list state (array containing customer-specific product price data)
        isLoading,               // Loading state (set to true when loading data)

        totalItems,              // Total items count state
        itemsPerPage,            // Items per page (number of data items to display per page selected by user)
        handleItemsPerPageChange,// Items per page change function (function for user to select how many items to view per page)

        handlePage,         // Page change function (function called when user navigates pages)
        totalPages,              // Total pages count (number of pages from total data divided by items per page)
        currentPage,             // Current page (page number user is currently viewing)

        pageInputValue,          // Page input field value
        handlePageInputChange,   // Page input value change function (function to change entered page number)

        customerSearchText,              // Search term state (customer)
        setCustomerSearchText,
        handleCustomerSearchTextChange,
        productSearchText,              // Search term state (product)
        setProductSearchText,
        handleProductSearchTextChange,

        startDate,               // Start date state
        setStartDate,
        handleStartDateChange,
        endDate,                 // End date state
        setEndDate,
        handleEndDateChange,
        targetDate,              // Target application date state
        setTargetDate,
        handleTargetDateChange,
        handleSearchDel,         // Common search term/search date delete function

        isCurrentPriceChecked,
        setIsCurrentPriceChecked,
        selectedStatus,          // Selected status (all/active/deleted)
        handleStatusChange,      // Status change function (all/active/deleted status change)

        selectedItems,           // Selected item ID array
        selectAll,               // Select all status
        handleCheckboxChange,    // Individual checkbox select/deselect function
        handleSelectAllChange,   // Select all/deselect checkbox click function

        isAdding,                // Adding state (whether add new item button is clicked)
        newPriceData,            // State containing new price data
        setIsAdding,             // Adding state change function (switch to adding state when add button clicked)
        handleInputChange,       // Input value change function (user input values reflected in state)
        handleAdd,
        handleAddSave,       // Function to add new price (save button click)
        handleAddCancel,         // Add state cancel function (cancel button click)

        handleEdit,              // Edit button click function (switch to edit mode)
        editingId,               // Item ID being edited (ID of item currently being edited)
        editedPriceData,         // State containing item data being edited
        handleSaveEdit,          // Edit save function (function to save edited data)
        handleCancelEdit,        // Edit cancel function (cancel edit mode)

        updateDeleteYn,            // Delete/restore button click function
        handleDelete,
        handleRestore,
        handleDeleteSelected,    // Delete selected

        sortField,
        setSortField,
        sortOrder,
        setSortOrder,
        fetchData,
    } = useHooksList();          // Use custom hook

    // 🟡 Render based on UI and state
    return (
        <Layout currentMenu="productPrice">
            <main className="main-content menu_price">
                <div className="menu_title">
                    <div className="sub_title">Product Management</div>
                    <div className="main_title">Customer-specific Product Price Management</div>
                </div>
                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            {/* 1️⃣ Show only prices applied today (checkbox) */}
                            <div className="checkbox_box">
                                <input
                                    type="checkbox"
                                    id="currentPrice"
                                    name="status"
                                    checked={isCurrentPriceChecked} // Checkbox state
                                    onChange={(e) => setIsCurrentPriceChecked(e.target.checked)} // Update check state
                                />
                                <label htmlFor="currentPrice"><i className="bi bi-check-lg"></i> Today</label>
                            </div>
                            {/* 2️⃣ Target application date (ex. show only prices applied tomorrow) */}
                            <div className={`date_box ${targetDate ? 'has_text' : ''}`}>
                                <label>Target Application Date</label>
                                <input
                                    type="date"
                                    max="9999-12-31"
                                    value={targetDate || ''}
                                    onChange={(e) => handleTargetDateChange(e.target.value)}
                                />
                                {/* Date delete button */}
                                {targetDate && (
                                    <button
                                        className="btn-del"
                                        onClick={() => handleSearchDel(setTargetDate)} // Use common function
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            {/* 3️⃣ Search term input */}
                            <div className={`search_box ${customerSearchText ? 'has_text' : ''}`}>
                                <label className="label_floating">Enter customer name</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={customerSearchText}
                                    onChange={handleCustomerSearchTextChange}
                                />
                                {/* Search term delete button */}
                                {customerSearchText && (
                                    <button
                                        className="btn-del"
                                        onClick={() => handleSearchDel(setCustomerSearchText)} // Use common function
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            <div className={`search_box ${productSearchText ? 'has_text' : ''}`}>
                                <label className="label_floating">Enter product name, product code</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={productSearchText}
                                    onChange={handleProductSearchTextChange}
                                />
                                {/* Search term delete button */}
                                {productSearchText && (
                                    <button
                                        className="btn-del"
                                        onClick={() => handleSearchDel(setProductSearchText)} // Use common function
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            {/* 4️⃣ Application period input (ex. show only prices applied from Jan 1, 2025) */}
                            <div className={`date_box ${startDate ? 'has_text' : ''}`}>
                                <label>Application Start Date</label>
                                <input
                                    type="date"
                                    max="9999-12-31"
                                    value={startDate || ''}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                />
                                {/* Date delete button */}
                                {startDate && (
                                    <button
                                        className="btn-del"
                                        onClick={() => handleSearchDel(setStartDate)} // Use common function
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            <div className={`date_box ${endDate ? 'has_text' : ''}`}>
                                <label>Application End Date</label>
                                <input
                                    type="date"
                                    max="9999-12-31"
                                    value={endDate || ''}
                                    onChange={(e) => handleEndDateChange(e.target.value)}
                                />
                                {/* Date delete button */}
                                {endDate && (
                                    <button
                                        className="btn-del"
                                        onClick={() => handleSearchDel(setEndDate)} // Use common function
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            {/* 5️⃣ Status selection */}
                            <div className="radio_box">
                                <span>Status</span>
                                <input
                                    type="radio"
                                    id="all"
                                    name="status"
                                    checked={selectedStatus === "all"}
                                    onChange={handleStatusChange}
                                />
                                <label htmlFor="all">All</label>
                                <input
                                    type="radio"
                                    id="active"
                                    name="status"
                                    checked={selectedStatus === "active"}
                                    onChange={handleStatusChange}
                                />
                                <label htmlFor="active">Active</label>
                                <input
                                    type="radio"
                                    id="deleted"
                                    name="status"
                                    checked={selectedStatus === "deleted"}
                                    onChange={handleStatusChange}
                                />
                                <label htmlFor="deleted">Deleted</label>
                            </div>
                        </div>
                        <div className="right">
                            <button className="box color" onClick={handleAdd} disabled={isAdding}><i className="bi bi-plus-circle"></i> Add New</button>
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
                                            onChange={handleSelectAllChange}
                                            checked={selectAll}
                                            disabled={isAdding || !!editingId}
                                        />
                                        <i className="chkbox_icon">
                                            <i className="bi bi-check-lg"></i>
                                        </i>
                                    </label>
                                </th>
                                <th>No.</th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'customer.customerName' ? 'active' : ''}`}>
                                        <span>Customer</span>
                                        <button className="btn_order" onClick={() => handleSortClick('customer.customerName')}>
                                            <i className={`bi ${sortField === 'customer.customerName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'product.productNm' ? 'active' : ''}`}>
                                        <span>Product</span>
                                        <button className="btn_order" onClick={() => handleSortClick('product.productNm')}>
                                            <i className={`bi ${sortField === 'product.productNm' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'priceCustomer' ? 'active' : ''}`}>
                                        <span>Price (KRW)</span>
                                        <button className="btn_order" onClick={() => handleSortClick('priceCustomer')}>
                                            <i className={`bi ${sortField === 'priceCustomer' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'priceStartDate' ? 'active' : ''}`}>
                                        <span>Application Start Date</span>
                                        <button className="btn_order" onClick={() => handleSortClick('priceStartDate')}>
                                            <i className={`bi ${sortField === 'priceStartDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'priceEndDate' ? 'active' : ''}`}>
                                        <span>Application End Date</span>
                                        <button className="btn_order" onClick={() => handleSortClick('priceEndDate')}>
                                            <i className={`bi ${sortField === 'priceEndDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'priceInsertDate' ? 'active' : ''}`}>
                                        <span>Registration Date/Time</span>
                                        <button className="btn_order" onClick={() => handleSortClick('priceInsertDate')}>
                                            <i className={`bi ${sortField === 'priceInsertDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'priceUpdateDate' ? 'active' : ''}`}>
                                        <span>Edit Date/Time</span>
                                        <button className="btn_order" onClick={() => handleSortClick('priceUpdateDate')}>
                                            <i className={`bi ${sortField === 'priceUpdateDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div className={`order_wrap ${sortField === 'priceDeleteDate' ? 'active' : ''}`}>
                                        <span>Deletion Date/Time</span>
                                        <button className="btn_order" onClick={() => handleSortClick('priceDeleteDate')}>
                                            <i className={`bi ${sortField === 'priceDeleteDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                        </button>
                                    </div>
                                </th>
                                {/* Edit/Delete buttons */}
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {/* Add new input row when in adding state */}
                            {isAdding && (
                                <PriceRow
                                    isEditMode={false} // Registration mode
                                    priceData={newPriceData}
                                    selectedCustomer={selectedCustomer}
                                    selectedProduct={selectedProduct}
                                    handleInputChange={handleInputChange}
                                    onSave={handleAddSave}
                                    onCancel={handleAddCancel}
                                    setCustomerModalOpen={setCustomerModalOpen}
                                    setProductModalOpen={setProductModalOpen}
                                    setSelectedCustomer={setSelectedCustomer}
                                    setSelectedProduct={setSelectedProduct}
                                />
                            )}

                            {/* Show loading image when loading */}
                            {isLoading ? (
                                <tr className="tr_empty">
                                    <td colSpan="10"> {/* Center loading animation */}
                                        <div className="loading">
                                            <span></span> {/* First circle */}
                                            <span></span> {/* Second circle */}
                                            <span></span> {/* Third circle */}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                priceList.length > 0 ? (
                                    priceList.map((m_price, index) => (
                                        editingId === m_price.priceNo ? (
                                            <PriceRow
                                                key={m_price.priceNo}
                                                isEditMode={true} // Edit mode
                                                priceData={editedPriceData}
                                                selectedCustomer={selectedCustomer}
                                                selectedProduct={selectedProduct}
                                                handleInputChange={handleInputChange}
                                                onSave={handleSaveEdit}
                                                onCancel={handleCancelEdit}
                                                setCustomerModalOpen={setCustomerModalOpen}
                                                setProductModalOpen={setProductModalOpen}
                                                setSelectedCustomer={setSelectedCustomer}
                                                setSelectedProduct={setSelectedProduct}
                                                currentPage={currentPage}
                                                itemsPerPage={itemsPerPage}
                                                index={index}
                                                priceInsertDate={m_price.priceInsertDate}
                                                priceUpdateDate={m_price.priceUpdateDate}
                                            />
                                        ) : (
                                            // Show existing data when not in edit mode
                                            <tr key={m_price.priceNo}
                                                className={
                                                    selectedItems.includes(m_price.priceNo)
                                                        ? ('selected_row')  // Selected row
                                                        : ''
                                                }
                                            >
                                                <td>
                                                    {/* Conditional rendering based on deleted status */}
                                                    {m_price.priceDeleteYn !== 'Y' ? (
                                                        <label className="chkbox_label">
                                                            <input
                                                                type="checkbox"
                                                                className="chkbox"
                                                                checked={selectedItems.includes(m_price.priceNo)}
                                                                onChange={() => handleCheckboxChange(m_price.priceNo)}
                                                                disabled={isAdding || !!editingId}
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
                                                <td>{m_price.customerName}</td>
                                                <td>
                                                    <p>{m_price.productNm}</p>
                                                    <p style={{ fontSize: '14px', color: '#999', marginTop: '2px' }}>{m_price.categoryPath}</p>
                                                </td>
                                                <td><b>{m_price.priceCustomer.toLocaleString()}</b> KRW</td>
                                                <td><div className='date_wrap'><i className="bi bi-calendar-check"></i>{format(m_price.priceStartDate, 'yyyy-MM-dd')}</div></td> {/* Application start date */}
                                                <td>
                                                    <div className='date_wrap'>
                                                        <i className="bi bi-calendar-check"></i>
                                                        {format(m_price.priceEndDate, 'yyyy-MM-dd')} {/* Application end date */}
                                                    </div>
                                                    <span className='diffdays'> (Total {differenceInDays(new Date(m_price.priceEndDate), new Date(m_price.priceStartDate)) + 1} days)</span> {/* Display application period */}
                                                </td>
                                                <td>{format(m_price.priceInsertDate, 'yy-MM-dd HH:mm')}</td>
                                                <td>{m_price.priceUpdateDate ? format(m_price.priceUpdateDate, 'yy-MM-dd HH:mm') : '-'}</td>
                                                <td>{m_price.priceDeleteDate ? format(m_price.priceDeleteDate, 'yy-MM-dd HH:mm') : '-'}</td>
                                                <td>
                                                    <div className='btn_group'>
                                                        {m_price.priceDeleteYn === 'Y' ? (
                                                            <button className="box icon hover_text restore" onClick={() => handleRestore(m_price.priceNo)}>
                                                                <i className="bi bi-arrow-clockwise"></i>{/* Restore */}
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button className="box icon hover_text edit" onClick={() => handleEdit(m_price.priceNo)}>
                                                                    <i className="bi bi-pencil-square"></i>{/* Edit */}
                                                                </button>
                                                                <button className="box icon hover_text del" onClick={() => handleDelete(m_price.priceNo)}>
                                                                    <i className="bi bi-trash"></i>{/* Delete */}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    ))
                                ) : (
                                    <tr className="tr_empty">
                                        <td colSpan="10">
                                            <div className="no_data"><i className="bi bi-exclamation-triangle"></i>No results found.</div>
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Use pagination component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        isLoading={isLoading}
                        pageInputValue={pageInputValue}
                        handlePage={handlePage}
                        handleItemsPerPageChange={handleItemsPerPageChange}
                        handlePageInputChange={handlePageInputChange}
                        handleDeleteSelected={handleDeleteSelected} // Delete selected function
                        selectedItems={selectedItems} // Pass selected items array
                        showFilters={true}
                    />

                </div>
            </main>
            {/* Customer search modal */}
            {isCustomerModalOpen && (
                <CustomerSearchModal
                    onClose={() => setCustomerModalOpen(false)}
                    onCustomerSelect={handleCustomerSelect}
                />
            )}
            {/* Product search modal */}
            {isProductModalOpen && (
                <ProductSearchModal
                    onClose={() => setProductModalOpen(false)}
                    onProductSelect={handleProductSelect}
                />
            )}
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Price />
    </BrowserRouter>
);