// src/main/react/components/sales/OrderHooks.js
import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";

export const useHooksList = () => {

    const [searchParams] = useSearchParams();
    const orderNo = searchParams.get('no'); // Order number
    const mode = searchParams.get('mode') || 'view'; // 'edit' or 'view'

    // Determine mode: create/edit/detail/resubmit
    const isCreateMode = !orderNo; // If no order number, it's create mode
    const isEditMode = mode === 'edit'; // Edit mode
    const isDetailView = !!orderNo && mode === 'view'; // Detail view mode
    const isResubmitMode = mode === 'resubmit'; // Resubmit mode
    const [order, setOrder] = useState({});  // Order data state
    const [deletedDetailIds, setDeletedDetailIds] = useState([]);  // Store deleted product detail IDs
    const [products, setProducts] = useState([{ name: '', price: '', quantity: '' }]); // Product list state
    const [customer, setCustomer] = useState([]);

    const [orderDetails, setOrderDetails] = useState([{
        orderNo: '', // Order detail ID
        productNm: '', // Product name
        orderDPrice: '', // Order price
        orderDQty: '', // Order quantity
        productCd: '', // Product code
        orderDDeliveryRequestDate: ''
    }]);
    const [showModal, setShowModal] = useState(false); // Modal visibility
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Search term
    const [searchCode, setSearchCode] = useState(''); // Product code search
    const [searchResults, setSearchResults] = useState([]); // Search results
    const [customerSearchResults, setCustomerSearchResults] = useState([]); // Customer search results
    const [orderHStatus, setOrderHStatus] = useState('');
    const [orderHTotalPrice, setOrderHTotalPrice] = useState(0);
    const [orderHInsertDate, setOrderHInsertDate] = useState(0);
    const [customerNo, setCustomerNo] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    let isSubmitting = false;

    const [customerData, setCustomerData] = useState({
        customerNo: '',
        customerName: '',
        customerAddr: '',
        customerTel: '',
        customerRepresentativeName: ''
    });

    // Date
    const [todayDate, setTodayDate] = useState('');

    // Employee
    const [employee, setEmployee] = useState(null); // Logged-in user info

    // Selected product index
    const [selectedProductIndex, setSelectedProductIndex] = useState(null);

    // Pagination state
    const [currentPageProduct, setCurrentPageProduct] = useState(1);
    const [itemsPerPageProduct, setItemsPerPageProduct] = useState(10);

    const [currentPageCustomer, setCurrentPageCustomer] = useState(1);
    const [itemsPerPageCustomer, setItemsPerPageCustomer] = useState(10);

    // Product modal pagination logic
    const indexOfLastProductResult = currentPageProduct * itemsPerPageProduct;
    const indexOfFirstProductResult = indexOfLastProductResult - itemsPerPageProduct;
    const paginatedSearchResults = searchResults.slice(indexOfFirstProductResult, indexOfLastProductResult);
    const totalProductPages = Math.ceil(searchResults.length / itemsPerPageProduct);

    // Customer modal pagination logic
    const indexOfLastCustomerResult = currentPageCustomer * itemsPerPageCustomer;
    const indexOfFirstCustomerResult = indexOfLastCustomerResult - itemsPerPageCustomer;
    const paginatedCustomerSearchResults = customerSearchResults.slice(indexOfFirstCustomerResult, indexOfLastCustomerResult);
    const totalCustomerPages = Math.ceil(customerSearchResults.length / itemsPerPageCustomer);

    const [deliveryDate, setDeliveryDate] = useState('');

    // Category selector
    const [categories, setCategories] = useState({
        topCategories: [],
        middleCategories: [],
        lowCategories: []
    });
    const [selectedCategory, setSelectedCategory] = useState({
        top: '',
        middle: '',
        low: ''
    });

    // 🟡 useEffect: Sync customer data
    useEffect(() => {
        setCustomerData(customer || {});
    }, [customer]);

    // 🟡 useEffect: Fetch categories based on selection
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const topResponse = await fetch('/api/category/top');
                const topData = await topResponse.json();
                setCategories(prev => ({ ...prev, topCategories: topData }));

                if (selectedCategory.top) {
                    const middleResponse = await fetch(`/api/category/middle/${selectedCategory.top}`);
                    const middleData = await middleResponse.json();
                    setCategories(prev => ({ ...prev, middleCategories: middleData }));
                }

                if (selectedCategory.middle) {
                    const lowResponse = await fetch(`/api/category/low/${selectedCategory.middle}/${selectedCategory.top}`);
                    const lowData = await lowResponse.json();
                    setCategories(prev => ({ ...prev, lowCategories: lowData }));
                }

            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, [selectedCategory.top, selectedCategory.middle]);

    // 🟡 useEffect: Fetch employee info
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await fetch('/api/employee', {
                    credentials: "include", // Include session
                });
                if (response.ok) {
                    const data = await response.json();
                    setEmployee(data);
                } else {
                    console.error('Failed to fetch employee info.');
                }
            } catch (error) {
                console.error('Error fetching employee info:', error);
            }
        };
        fetchEmployee();
    }, []);

    // 🟡 useEffect: Fetch order details (for view/edit)
    useEffect(() => {
        if (orderNo) {
            fetchOrderDetail(orderNo);
        }
    }, [orderNo]);

    // 🟡 useEffect: Set today’s date
    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months start at 0
        const day = today.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        setTodayDate(formattedDate);
        setDeliveryDate(formattedDate); // Default delivery date
    }, []);

    // Other useEffects and handlers follow...
    // Translations: Korean comments → English, variable names preserved for clarity

    // Format date helper
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    };

    return {
        // Order mode states
        isCreateMode,
        isEditMode,
        isDetailView,
        isResubmitMode,

        // Order number
        orderNo,

        // Data & states
        products,
        customerData,
        orderDetails,
        orderHStatus,
        orderHTotalPrice,
        orderHInsertDate,
        employee,

        // Handlers
        handleProductChange,
        handleProductEdit,
        addProductRow,
        removeProductRow,
        removeProducteditRow,

        handleSubmit,
        handleEdit,
        handleResubmit,

        formatDateForInput,
        displayItems,
        editProductRow,
        displayItemEdit,
        setCustomerData,
        selectedProductIndex,
        setProducts,
        setOrderDetails,
        setSelectedProductIndex,
    };
};
