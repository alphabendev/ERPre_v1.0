// src/main/react/components/common/CustomerSearchModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination'; // Import pagination component
import { useDebounce } from '../common/useDebounce'; // Import useDebounce hook

function CustomerSearchModal({ onClose, onCustomerSelect }) {

    const [loading, setLoading] = useState(false); // 🔴 Loading state added

    // 🔴 Search term and search results state management
    const [customerSearchText, setCustomerSearchText] = useState(''); // Customer search term state
    const debouncedCustomerSearchText = useDebounce(customerSearchText, 300); // Apply delay
    const [customerSearchResults, setCustomerSearchResults] = useState([]); // Customer search results state
    const [currentPage, setCurrentPage] = useState(1); // Current page state

    const itemsPerPage = 10; // Items per page
    const totalPages = Math.ceil(customerSearchResults.length / itemsPerPage); // Calculate total pages
    const indexOfLastResult = currentPage * itemsPerPage; // Last item index of current page
    const indexOfFirstResult = indexOfLastResult - itemsPerPage; // First item index of current page
    const paginatedCustomerSearchResults = customerSearchResults.slice(indexOfFirstResult, indexOfLastResult); // Extract items for current page

    // 🔴 Customer search processing function (async)
    const fetchData = async () => {
        setLoading(true); // Start loading
        try {
            // Search API call
            const response = await axios.get(`/api/customer/search`, {
                params: {
                    name: customerSearchText // Customer name filter
                }
            });
            const data = response.data; // axios automatically converts JSON response
            setCustomerSearchResults(data); // Update search results state
            setCurrentPage(1); // Reset to first page after search
            setLoading(false); // End loading
        } catch (error) {
            // Error handling
            console.error('Error occurred during search:', error);
            setCustomerSearchResults([]); // Reset search results
            setLoading(false); // End loading on error
        }
    };

    // 🟡 Call initial search when component first renders
    useEffect(() => {
        fetchData();
    }, []); // Empty array ensures it runs only once on initial render

    // 🟡 Call fetchData after search term is debounced (customer)
    useEffect(() => {
        fetchData();
    }, [debouncedCustomerSearchText]);

    // 🟢 Page change handling function
    const handlePage = (pageNumber) => {
        setCurrentPage(pageNumber); // Update page number state
    };

    // 🟢 Common function for search term delete button click
    const handleSearchDel = (setSearch) => {
        setSearch(''); // Common function to set state to ''
    };

    // 🟢 Search term change (customer)
    const handleCustomerSearchTextChange = (event) => {
        setCustomerSearchText(event.target.value);
    };

    // 🟢 Close window when modal background is clicked
    const handleBackgroundClick = (e) => {
        if (e.target.className === 'modal_overlay') {
            onClose();
        }
    };

    // 🟢 Click on searched customer
    const handleCustomerClick = (customer) => {
        onCustomerSelect(customer); // Call function passed from parent component (handleCustomerSelect)
        onClose(); // Close modal
    };

    // 🟣 Modal rendering
    return (
        <div className="modal_overlay" onMouseDown={handleBackgroundClick}>
            <div className="modal_container search search_customer">
                <div className="header">
                    <div>Customer Search</div>
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button> {/* Modal close button */}
                </div>
                <div className="search_wrap">
                    <div className={`search_box ${customerSearchText ? 'has_text' : ''}`}>
                        <label className="label_floating">Customer</label>
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            className="box search"
                            value={customerSearchText}
                            onChange={handleCustomerSearchTextChange}
                            style={{ width: '250px' }} // Apply width via inline style
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
                </div>
                <div className="table_wrap">
                    {/* Display list when search results exist */}
                    <table>
                        <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Address</th>
                            <th>Contact</th>
                            <th>Representative</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr className="tr_empty">
                                <td colSpan="3"> {/* Center loading animation */}
                                    <div className="loading">
                                        <span></span> {/* First circle */}
                                        <span></span> {/* Second circle */}
                                        <span></span> {/* Third circle */}
                                    </div>
                                </td>
                            </tr>
                        ) : customerSearchResults.length > 0 ? (
                            /* Display searched customer list */
                            paginatedCustomerSearchResults.map((result) => (
                                <tr key={result.customerNo} onClick={() => handleCustomerClick(result)}>
                                    <td>{result.customerName || '-'}</td> {/* Customer name */}
                                    <td>{result.customerAddr || '-'}</td> {/* Customer address */}
                                    <td>{result.customerTel || '-'}</td> {/* Customer contact */}
                                    <td>{result.customerRepresentativeName || '-'}</td> {/* Representative name */}
                                </tr>
                            ))
                        ) : (
                            <tr className="tr_empty">
                                <td colSpan="4">
                                    <div className="no_data">No results found.</div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Use pagination component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePage={handlePage}
                    showFilters={false} // Hide filtering section for simple version
                />
            </div>
        </div>
    );
}

export default CustomerSearchModal;