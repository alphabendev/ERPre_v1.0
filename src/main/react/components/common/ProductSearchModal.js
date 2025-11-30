import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination'; // Import pagination component

function ProductSearchModal({ onClose, onProductSelect, customerNo = null }) { // For price registration -> simple product search, For order registration -> search products for specific customer (customerNo)

    const [loading, setLoading] = useState(false); // 🔴 Loading state added

    // 🔴 Search term state management
    const [searchName, setSearchName] = useState(''); // Product name search term
    const [searchCode, setSearchCode] = useState('');   // Product code search term
    const [searchResults, setSearchResults] = useState([]); // Search results array state
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const [totalPages, setTotalPages] = useState(0); // Total pages state

    const itemsPerPage = 10; // Number of items to display per page

    // 🔴 All category states
    const [allCategories, setAllCategories] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [middleCategories, setMiddleCategories] = useState([]);
    const [lowCategories, setLowCategories] = useState([]);

    // 🔴 Selected categories
    const [selectedCategory, setSelectedCategory] = useState({
        top: '',
        middle: '',
        low: ''
    });

    // 🔴 Product fetch function
    const fetchProducts = () => {
        setLoading(true); // Start loading

        // Create parameter object for API request
        const params = {
            page: currentPage,
            size: itemsPerPage,
            topCategoryNo: selectedCategory.top || null,    // Top category
            middleCategoryNo: selectedCategory.middle || null, // Middle category
            lowCategoryNo: selectedCategory.low || null,    // Low category
            productCd: searchCode || null,                  // Product code filter
            productNm: searchName || null,                 // Product name filter
            status: 'active',                              // Only fetch active products
        };

        // 🔴 Add only if customerNo exists
        if (customerNo) {
            params.customerNo = customerNo;
        }

        axios.get('/api/products/productsFilter', { params })
            .then((response) => {
                const data = response.data.content || []; // Extract product list from server response
                console.log("Search results:", data);
                setSearchResults(data); // Update search results state
                setTotalPages(response.data.totalPages || 0); // Set total pages
                setLoading(false); // End loading
            })
            .catch((error) => {
                console.error('Failed to fetch product list', error);
                setLoading(false); // End loading on error
            });
    };


    // 🟡 Fetch all categories when component mounts
    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const response = await axios.get('/api/category/all');
                const categories = response.data;
                console.log("All category data:", categories);

                setAllCategories(categories);

                // Classify top categories
                const top = categories.filter(cat => !cat.parentCategoryNo);
                setTopCategories(top);
                console.log("Top categories:", top);

                // Classify middle categories
                const middle = categories.filter(cat => cat.parentCategoryNo && top.some(topCat => topCat.categoryNo === cat.parentCategoryNo));
                setMiddleCategories(middle);
                console.log("Middle categories:", middle);

                // Classify low categories
                const low = categories.filter(cat => {
                    const middleCat = middle.find(m => m.categoryNo === cat.parentCategoryNo);
                    return middleCat && top.some(topCat => topCat.categoryNo === middleCat.parentCategoryNo);
                });
                setLowCategories(low);
                console.log("Low categories:", low);

            } catch (error) {
                console.error('Failed to fetch all categories:', error);
            }
        };

        fetchAllCategories();
    }, []); // Run only once with empty dependency array

    // 🟡 Filter middle categories when top category changes
    useEffect(() => {
        console.log("selectedCategory.top when top category changes:", selectedCategory.top);
        if (selectedCategory.top) {
            // Convert selectedCategory.top to number
            const topValue = Number(selectedCategory.top);
            const filteredMiddle = allCategories.filter(cat => cat.parentCategoryNo === topValue);
            console.log("Filtered middle categories:", filteredMiddle);
            setMiddleCategories(filteredMiddle);
        } else {
            setMiddleCategories([]);
        }
        setSelectedCategory(prev => {
            if (prev.middle !== '' || prev.low !== '') {
                return { ...prev, middle: '', low: '' };
            }
            return prev; // No state update if values are the same
        });
        setLowCategories([]);
    }, [selectedCategory.top, allCategories]);

    // 🟡 Filter low categories when middle category changes
    useEffect(() => {
        if (selectedCategory.middle) {
            const middleValue = Number(selectedCategory.middle);
            const filteredLow = allCategories.filter(cat => cat.parentCategoryNo === middleValue);
            console.log("Filtered low categories:", filteredLow);
            setLowCategories(filteredLow);
        } else {
            setLowCategories([]);
        }
        setSelectedCategory(prev => {
            if (prev.low !== '') {
                return { ...prev, low: '' };
            }
            return prev;
        });
    }, [selectedCategory.middle, allCategories]);

    // 🟡 Fetch products whenever search conditions or page changes
    useEffect(() => {
        let isMounted = true; // Variable to check if component is mounted
        if (isMounted) {
            fetchProducts(); // Execute only when state changes
        }
        return () => {
            isMounted = false; // Stop API call when component unmounts
        };
    }, [searchCode, searchName, selectedCategory, currentPage]);

    // 🟢 Page change handling function
    const handlePage = (pageNumber) => {
        setCurrentPage(pageNumber); // Update page number state
    };

    // 🟢 Top category change handling function
    const handleTopChange = (e) => {
        const topValue = e.target.value;
        console.log("handleTopChange - selected top category:", topValue);
        setSelectedCategory({
            top: topValue,
            middle: '',
            low: ''
        });
        setMiddleCategories([]);
        setLowCategories([]);
    };

    // 🟢 Middle category change handling function
    const handleMiddleChange = (e) => {
        const middleValue = e.target.value;
        console.log("handleMiddleChange - selected middle category:", middleValue);
        setSelectedCategory(prev => ({
            ...prev,
            middle: middleValue,
            low: ''
        }));
        setLowCategories([]);
    };

    // 🟢 Low category change handling function
    const handleLowChange = (e) => {
        const lowValue = e.target.value;
        console.log("handleLowChange - selected low category:", lowValue);
        setSelectedCategory(prev => ({
            ...prev,
            low: lowValue
        }));
    };

    // 🟢 Common function for search term delete button click
    const handleSearchDel = (setSearch) => {
        setSearch(''); // Common function to set state to ''
    };

    // 🟢 Close window when modal background is clicked
    const handleBackgroundClick = (e) => {
        if (e.target.className === 'modal_overlay') {
            onClose();
        }
    };

    // 🟣 Modal rendering
    return (
        <div className="modal_overlay" onMouseDown={handleBackgroundClick}>
            <div className="modal_container search search_product">
                <div className="header">
                    <div>Product Search</div>
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button> {/* Modal close button */}
                </div>
                <div className="search_wrap">
                    {/* Top category selector */}
                    <div className={`select_box ${selectedCategory.top ? 'selected' : ''}`} >
                        <label className="label_floating">Top Category</label>
                        <select
                            className="box" value={selectedCategory.top} onChange={handleTopChange}>
                            <option value="">Top Category</option>
                            {topCategories.map(category => (
                                <option key={category.categoryNo}
                                        value={category.categoryNo}>{category.categoryNm}</option>
                            ))}
                        </select>
                    </div>

                    {/* Middle category selector */}
                    <div className={`select_box ${selectedCategory.middle ? 'selected' : ''}`} >
                        <label className="label_floating">Middle Category</label>
                        <select
                            className="box" value={selectedCategory.middle} onChange={handleMiddleChange}
                            disabled={!selectedCategory.top}>
                            <option value="">Middle Category</option>
                            {middleCategories.map(category => (
                                <option key={category.categoryNo}
                                        value={category.categoryNo}>{category.categoryNm}</option>
                            ))}
                        </select>
                    </div>

                    {/* Low category selector */}
                    <div className={`select_box ${selectedCategory.low ? 'selected' : ''}`} >
                        <label className="label_floating">Low Category</label>
                        <select
                            className="box" value={selectedCategory.low} onChange={handleLowChange}
                            disabled={!selectedCategory.middle}>
                            <option value="">Low Category</option>
                            {lowCategories.map(category => (
                                <option key={category.categoryNo}
                                        value={category.categoryNo}>{category.categoryNm}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search term input fields */}
                <div className="search_wrap" style={{ marginTop: '5px' }}>
                    {/* Product name search */}
                    <div className={`search_box ${searchName ? 'has_text' : ''}`}>
                        <label className="label_floating">Product Name</label>
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            className="box"
                            value={searchName} // Connect to product name search term state
                            onChange={(e) => setSearchName(e.target.value)} // Handle product name search term change
                        />
                        {searchName && (
                            <button className="btn-del" onClick={() => handleSearchDel(setSearchName)}>
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>

                    {/* Product code search */}
                    <div className={`search_box ${searchCode ? 'has_text' : ''}`}>
                        <label className="label_floating">Product Code</label>
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            className="box"
                            value={searchCode} // Connect to product code search term state
                            onChange={(e) => setSearchCode(e.target.value)} // Handle product code search term change
                        />
                        {searchCode && (
                            <button className="btn-del" onClick={() => handleSearchDel(setSearchCode)}>
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Search results table */}
                <div className="table_wrap">
                    <table>
                        <thead>
                        <tr>
                            <th>Product Code</th>
                            <th>Category</th>
                            <th>Product Name</th>
                            <th>Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr className="tr_empty">
                                <td colSpan="4"> {/* Center loading animation */}
                                    <div className="loading">
                                        <span></span> {/* First circle */}
                                        <span></span> {/* Second circle */}
                                        <span></span> {/* Third circle */}
                                    </div>
                                </td>
                            </tr>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((result, index) => (
                                <tr key={index} onClick={() => onProductSelect(result)}>
                                    <td>{result.productCd || '-'}</td> {/* Product code */}
                                    <td>{result.lowCategory}</td> {/* Product category */}
                                    <td>{result.productNm || '-'}</td> {/* Product name */}
                                    <td>
                                        {/* Customer-specific product price or product price (base price) */}
                                        {customerNo ? (
                                            result.priceCustomer ? (
                                                `${result.priceCustomer.toLocaleString()}원`
                                            ) : (
                                                '-'
                                            )
                                        ) : (
                                            result.productPrice ? (
                                                `${result.productPrice.toLocaleString()}원`
                                            ) : (
                                                '-'
                                            )
                                        )}
                                    </td>
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

                {/* Pagination component */}
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

export default ProductSearchModal;