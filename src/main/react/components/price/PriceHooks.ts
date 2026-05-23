// src/main/react/components/price/PriceHooks.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useDebounce } from '../common/useDebounce'; // Import useDebounce hook

// 🔴 Date formatting function
function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // Invalid date
    return format(d, 'yyyy-MM-dd');
}

export const useHooksList = () => {

    // Get today's date
    const today = format(new Date(), 'yyyy-MM-dd');

    // 🔴 useState: Define and initialize states
    const [priceList, setPriceList] = useState([]); // Price list

    const [totalItems, setTotalItems] = useState(0); // Total items count
    const [totalPages, setTotalPages] = useState(0); // Total pages count

    const [itemsPerPage, setItemsPerPage] = useState(20); // Items per page
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const [pageInputValue, setPageInputValue] = useState(1); // Page input field value

    const [selectedCustomerNo, setSelectedCustomerNo] = useState(''); // Selected customer
    const [selectedProductCd, setSelectedProductCd] = useState(''); // Selected product

    const [customerSearchText, setCustomerSearchText] = useState(''); // Customer search term
    const debouncedCustomerSearchText = useDebounce(customerSearchText, 300); // Apply delay
    const [productSearchText, setProductSearchText] = useState(''); // Product search term
    const debouncedProductSearchText = useDebounce(productSearchText, 300); // Apply delay

    const [startDate, setStartDate] = useState(null); // Start date
    const [endDate, setEndDate] = useState(null); // End date
    const [targetDate, setTargetDate] = useState(null);
    const [isCurrentPriceChecked, setIsCurrentPriceChecked] = useState(false); // Currently applied price checkbox state

    const [selectedStatus, setSelectedStatus] = useState("active"); // Status

    // Checkbox state management
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false); // Set initial value to false

    const [sortField, setSortField] = useState('priceInsertDate'); // Sort field (default: registration date/time)
    const [sortOrder, setSortOrder] = useState('desc'); // Sort order (default: descending)

    const [isLoading, setLoading] = useState(true); // Loading state management

    const [isAdding, setIsAdding] = useState(false); // Add button click state
    const [newPriceData, setNewPriceData] = useState({
        customerName: '',
        productNm: '',
        categoryNm: '',
        priceCustomer: '',
        priceStartDate: null,
        priceEndDate: null
    });

    const [editingId, setEditingId] = useState(null); // Store ID of item being edited
    const [editedPriceData, setEditedPriceData] = useState({}); // Store data of item being edited

    const [isInitialRender, setIsInitialRender] = useState(true); // State variable to track initial rendering

    // 🔴🔴🔴 select
    const fetchData = async () => {
        console.log("🔴 fetch");
        setLoading(true);
        const MIN_LOADING_TIME = 100;
        const startTime = Date.now();

        try {
            const response = await axios.get('/api/price/all', {
                params: {
                    customerNo: selectedCustomerNo || null,
                    productCd: selectedProductCd || null,
                    startDate: startDate ? formatDate(startDate) : null,
                    endDate: endDate ? formatDate(endDate) : null,
                    targetDate: targetDate ? formatDate(targetDate) : null,
                    customerSearchText: debouncedCustomerSearchText || null,
                    productSearchText: debouncedProductSearchText || null,
                    selectedStatus: selectedStatus || null,
                    page: currentPage > 0 ? currentPage : 1,
                    size: itemsPerPage > 0 ? itemsPerPage : 20,
                    sort: sortField,
                    order: sortOrder,
                },
            });

            const { content, totalElements, totalPages } = response.data;
            setPriceList(content);
            setTotalItems(totalElements);
            setTotalPages(totalPages);
        } catch (error) {
            console.error('Error occurred while loading data:', error);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = MIN_LOADING_TIME - elapsedTime;
            setTimeout(() => {
                setLoading(false);
            }, remainingTime > 0 ? remainingTime : 0);

            // Reset states
            setIsAdding(false);
            setEditingId(null);
            setEditedPriceData({});
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    // 🔴🔴🔴 update(del_yn - delete or restore)
    const updateDeleteYnList = async (priceList, successMessage, errorMessage) => {
        try {
            await axios.put('/api/price/updateDel', priceList);
            await fetchData();
            window.showToast(successMessage);
        } catch (error) {
            console.error(errorMessage, error);
            window.showToast(errorMessage);
        }
    };

    // 🔴 Connect to updateDeleteYnList
    const updateDeleteYn = async (priceNo, deleteYn) => {
        const priceList = [{ priceNo, priceDeleteYn: deleteYn }];
        const successMessage = deleteYn === 'Y' ? 'The item has been deleted.' : 'The item has been restored.';
        const errorMessage = `An error occurred during ${deleteYn === 'Y' ? 'deletion' : 'restoration'} processing.`;
        await updateDeleteYnList(priceList, successMessage, errorMessage);
    };

    // 🟡 Display price list based on conditions
    useEffect(() => {
        console.log("🔴 fetch 11");
        fetchData();
    }, [selectedCustomerNo, selectedProductCd, startDate, endDate, selectedStatus, currentPage, itemsPerPage, sortField, sortOrder, debouncedCustomerSearchText, debouncedProductSearchText]);

    // 🟡 Manage targetDate when "Show only prices applied today" checkbox is checked
    useEffect(() => {
        if (isCurrentPriceChecked) {
            if (targetDate !== today) {
                setTargetDate(today);
            }
        } else {
            if (targetDate === today) {
                setTargetDate(null); // Reset when unchecked if targetDate is today
            }
        }
    }, [isCurrentPriceChecked]);

    // 🟡 Uncheck if targetDate is not today's date (control to not run during initial rendering)
    useEffect(() => {
        if (!isInitialRender) {
            if (targetDate === today && !isCurrentPriceChecked) {
                setIsCurrentPriceChecked(true);
            } else if (targetDate !== today && isCurrentPriceChecked) {
                setIsCurrentPriceChecked(false);
            }
            fetchData(); // Execute fetchData when targetDate changes
        } else {
            setIsInitialRender(false); // Set after initial rendering
        }
    }, [targetDate]);

    // 🟡 Update pageInputValue when currentPage changes
    useEffect(() => {
        if (pageInputValue !== currentPage && pageInputValue > 0) {
            setPageInputValue(currentPage);
        }
    }, [currentPage]);

    // 🟡 Update currentPage when pageInputValue changes
    useEffect(() => {
        if (pageInputValue !== currentPage) {
            setCurrentPage(pageInputValue > 0 ? pageInputValue : 1);
        }
    }, [pageInputValue]);

    // 🟡 Check "Select All" checkbox when all items are selected
    useEffect(() => {
        if (selectedItems.length === 0) {
            setSelectAll(false); // Uncheck select all checkbox when all items are deselected
        } else {
            setSelectAll(selectedItems.length === priceList.length); // Check select all checkbox when all items are selected
        }
    }, [selectedItems, priceList]);

    // 🟡 Check and unset targetDate when startDate or endDate changes
    useEffect(() => {
        if (targetDate) {
            if (startDate && targetDate < startDate) {
                setTargetDate(null); // Unset if targetDate is before startDate
            } else if (endDate && targetDate > endDate) {
                setTargetDate(null); // Unset if targetDate is after endDate
            }
        }
    }, [startDate, endDate, targetDate]);

    // 🟢 Change items per page (1~500)
    const handleItemsPerPageChange = (e) => {
        let value = e.target.value;
        value = value.replace(/[^\d]/g, ''); // Remove all non-numeric characters
        if (parseInt(value, 10) > 500) value = 500;
        setItemsPerPage(value); // Change items per page
        setCurrentPage(1); // Reset page number
    };

    // 🟢 Change page number (1~max page)
    const handlePageInputChange = (e) => {
        let value = e.target.value;
        value = value.replace(/[^\d]/g, ''); // Remove all non-numeric characters
        // Handle empty value
        if (value === '') {
            setPageInputValue(''); // Clear input field
            return;
        }
        // Handle max page limit
        value = parseInt(value, 10);
        if (value > totalPages) value = totalPages; // Set to max page if exceeds total pages
        setPageInputValue(value); // Set page input field value
    };

    // 🟢 Input value change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPriceData({
            ...newPriceData,
            [name]: value
        });
    };

    // 🟢 Search term change (customer)
    const handleCustomerSearchTextChange = (event) => {
        setCustomerSearchText(event.target.value);
    };

    // 🟢 Search term change (product)
    const handleProductSearchTextChange = (event) => {
        setProductSearchText(event.target.value);
    };

    // 🟢 Start date change
    const handleStartDateChange = (value) => {
        setStartDate(value); // Only update start date state
    };

    // 🟢 End date change
    const handleEndDateChange = (value) => {
        setEndDate(value); // Only update end date state
    };

    // 🟢 Application date change
    const handleTargetDateChange = (value) => {
        setTargetDate(value);
    };

    // 🟢 Status change
    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.id);
    };

    // 🟢 Individual checkbox selection
    const handleCheckboxChange = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    // 🟢 Select all/deselect all
    const handleSelectAllChange = () => {
        if (selectAll) {
            // Deselect all
            setSelectedItems([]);
        } else {
            // Select only items with status 'N'
            setSelectedItems(priceList.filter(item => item.priceDeleteYn !== 'Y').map(item => item.priceNo));
        }
        setSelectAll(!selectAll); // Toggle select all state
    };

    // 🟣 Common function for search term delete button click
    const handleSearchDel = (setSearch) => {
        setSearch(''); // Common function to set state to ''
    };

    // 🟣 Page number click
    const handlePage = (pageNumber) => {
        setCurrentPage(pageNumber); // Change current page to clicked page number
    };

    // 🟣 Add button click
    const handleAdd = () => {
        setIsAdding(true);  // Activate adding state
        setEditingId(null); // Reset edit state
        setEditedPriceData({}); // Reset data being edited
        setSelectedItems([]); // Reset selection state
    };

    // 🟣 Add-save button click
    const handleAddSave = () => {
        window.showToast('Saved successfully.');
        console.log('Register new price information:', newPriceData);
        setIsAdding(false); // Hide add row
        fetchData(); // Re-fetch data
    };

    // 🟣 Add-cancel button click
    const handleAddCancel = () => {
        setIsAdding(false); // Hide add row
    };

    // 🟣 Edit button click
    const handleEdit = (priceNo) => {

        setIsAdding(false); // Reset registration state
        setSelectedItems([]); // Reset selection state

        // Find data to edit
        const priceDataToEdit = priceList.find((item) => item.priceNo === priceNo);

        // Set current editing priceNo to editingId and set data to edit to editedPriceData
        setEditingId(priceNo);
        setEditedPriceData({
            priceNo: priceDataToEdit.priceNo,
            customerName: priceDataToEdit.customerName,
            customerNo: priceDataToEdit.customerNo,
            productNm: priceDataToEdit.productNm,
            productCd: priceDataToEdit.productCd,
            categoryNm: priceDataToEdit.categoryNm,
            priceCustomer: priceDataToEdit.priceCustomer,
            priceStartDate: priceDataToEdit.priceStartDate,
            priceEndDate: priceDataToEdit.priceEndDate
        });
    };

    // 🟣 Edit complete button click
    const handleSaveEdit = () => {
        window.showToast('Edited successfully.');
        // After edit completion, reset editingId and editedPriceData
        setEditingId(null);
        setEditedPriceData({});
        fetchData(); // Re-fetch data
    };

    // 🟣 Edit cancel button click
    const handleCancelEdit = () => {
        // Edit cancel: reset editingId and data being edited
        setEditingId(null);
        setEditedPriceData({});
    };

    // 🟣 Delete button click (single delete)
    const handleDelete = (priceNo) => {
        window.confirmCustom("Do you want to delete this item?").then(result => {
            if (result) {
                updateDeleteYn(priceNo, 'Y');
            }
        });
    };

    // 🟣 Delete selected button click (update del_yn)
    const handleDeleteSelected = () => {
        window.confirmCustom(`Do you want to delete ${selectedItems.length} selected items?`).then(result => {
            if (result) {
                const priceList = selectedItems.map(item => ({
                    priceNo: item,
                    priceDeleteYn: 'Y'  // Update del_yn value to 'Y'
                }));

                const successMessage = `${selectedItems.length} selected items have been deleted.`;
                const errorMessage = 'An error occurred during selected item deletion processing.';

                updateDeleteYnList(priceList, successMessage, errorMessage)
                    .then(() => {
                        // Update state
                        setSelectedItems([]);  // Reset selected items after deletion
                        setSelectAll(false);   // Uncheck select all checkbox
                    })
                    .catch(error => {
                        console.error("Error occurred during selected item deletion processing:", error);
                        window.showToast('An error occurred during selected item deletion processing.');
                    });
            }
        });
    };

    // 🟣 Restore button click
    const handleRestore = (priceNo) => updateDeleteYn(priceNo, 'N');

    // 🟣 Open modal
    const openConfirmModal = () => {
        setConfirmModalOpen(true);
    };

    // 🟣 Close modal
    const closeConfirmModal = () => {
        setConfirmModalOpen(false);
    };

    // Execute when user clicks confirm button in modal
    const handleConfirmAction = async () => {
        if (confirmedAction) {
            await confirmedAction();  // Execute user-confirmed action
        }
        closeConfirmModal();  // Close modal
    };

    return {
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
    };

};