// src/main/react/components/price/PriceRow.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; // react-hook-form import
import { format } from 'date-fns';
import axios from 'axios'; // axios import

const PriceRow = ({
                      isEditMode,
                      priceData,
                      selectedCustomer = { customerName: '', customerNo: '' }, // Set default values
                      selectedProduct = { productNm: '', productCd: '', productPrice: 0 },      // Set default values
                      onSave,
                      onCancel,
                      setCustomerModalOpen,
                      setProductModalOpen,
                      setSelectedCustomer, // Function to set value after customer selection
                      setSelectedProduct,   // Function to set value after product selection
                      currentPage,
                      itemsPerPage,
                      index,
                      priceInsertDate,
                      priceUpdateDate,
                  }) => {

    // Comma formatting function
    const formatPriceWithComma = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // 🔴 react-hook-form setup
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitted },
        setValue,
        watch,
        trigger, // Add trigger function
    } = useForm({
        defaultValues: priceData,
        mode: 'onChange', // Run validation on input change
    });

    // 🔴 Field value watching (watch: detect value changes in real-time within form without useState)
    const priceCustomer = watch('priceCustomer'); // Watch price field
    const selectedCustomerNo = watch('selectedCustomerNo'); // Watch customer number field
    const selectedProductCd = watch('selectedProductCd'); // Watch product code field
    const priceStartDate = watch('priceStartDate'); // Watch start date field
    const priceEndDate = watch('priceEndDate'); // Watch end date field

    // 🔴 Product price state addition
    const [productPrice, setProductPrice] = useState(selectedProduct.productPrice);

    // 🔴🔴🔴 update(adjust application dates of existing data with overlapping periods)
    const handleDuplicateCheck = async (duplicatePrices, inputStartDate, inputEndDate, data) => {

        // 🟢 Determine which data to use from duplicate data based on conditions
        let duplicatePrice;
        // Select duplicate data excluding currently editing data in edit mode
        if (isEditMode && duplicatePrices.length > 1) {
            duplicatePrice = duplicatePrices.find(price => price.priceNo !== priceData.priceNo);
        } else {
            duplicatePrice = duplicatePrices[0];
        }

        // 🟢 Organize data to use
        const existingStart = duplicatePrice.priceStartDate;
        const existingEnd = duplicatePrice.priceEndDate;
        const inputStart = inputStartDate;
        const inputEnd = inputEndDate;
        let updatedStartDate = existingStart;
        let updatedEndDate = existingEnd;
        console.log("inputStart : " + inputStart);
        console.log("inputStart < inputEnd : " + (inputStart < inputEnd));
        console.log("inputStart > inputEnd : " + (inputStart > inputEnd));

        // 🟢 Cannot modify existing data, must modify input data
        // 1️⃣ When existing data applies only to a specific single day
        if (existingStart === existingEnd) {
            console.log("case 1");
            window.showToast(`Data exists only for ${existingStart}.`, 'error');
            return;
        }

        // 2️⃣ When input period completely includes existing data (ex: existing 2~3 days, input 1~5 days)
        if (inputStart <= existingStart && inputEnd >= existingEnd) {
            console.log("case 2");
            window.showToast(`Data exists for ${existingStart}~${existingEnd}.`, 'error');
            return;
        }

        // 🟢 Modify existing data, adjust start or end date to not overlap with input data
        // Set modal message to modify existing data's start or end date based on overlapping dates
        let updateMessage = `For the corresponding customer and product, data exists for <br>`;
        // 3️⃣ When input end date is greater than existing end date -> Adjust existing data's end date to day before input start date💡1
        if (inputEnd > existingEnd) {
            console.log("case 3");
            const prevDay = new Date(inputStart);
            prevDay.setDate(prevDay.getDate() - 1);
            updatedEndDate = prevDay.toISOString().split('T')[0]; // Convert to yyyy-mm-dd format
            updateMessage += `${existingStart} ~ <strong>${existingEnd}</strong> period.<br>`;
            updateMessage += `Do you want to modify the <strong>end date</strong> of this data to <strong>${updatedEndDate}</strong>?`;
        }
        // 4️⃣ When input end date is less than existing end date
        else {
            if (inputStart > existingStart) { // Adjust existing data's end date to day before input start date (when existing data includes input data)💡1
                console.log("case 4-1");
                const prevDay = new Date(inputStart);
                prevDay.setDate(prevDay.getDate() - 1);
                updatedEndDate = prevDay.toISOString().split('T')[0]; // Convert to yyyy-mm-dd format
                updateMessage += `${existingStart} ~ <strong>${existingEnd}</strong> period.<br>`;
                updateMessage += `Do you want to modify the <strong>end date</strong> of this data to <strong>${updatedEndDate}</strong>?`;
            } else { // Adjust existing data's start date to day after input end date💡2
                console.log("case 4-2");
                const nextDay = new Date(inputEnd);
                nextDay.setDate(nextDay.getDate() + 1);
                updatedStartDate = nextDay.toISOString().split('T')[0]; // Convert to yyyy-mm-dd format
                updateMessage += `<strong>${existingStart}</strong> ~ ${existingEnd} period.<br>`;
                updateMessage += `Do you want to modify the <strong>start date</strong> of this data to <strong>${updatedStartDate}</strong>?`;
            }
        }

        // 🟢 Confirm window
        window.confirmCustom(updateMessage, "500px").then(result => {
            if (result) {
                const requestData = [{
                    priceNo: duplicatePrice.priceNo,  // Use existing data's priceNo
                    customerNo: duplicatePrice.customerNo, //
                    productCd: duplicatePrice.productCd, //
                    priceCustomer: duplicatePrice.priceCustomer,  // Price
                    priceStartDate: updatedStartDate,  // Modified start date
                    priceEndDate: updatedEndDate  // Modified end date
                }];

                console.log('🟢 Existing data modification Request Data to be sent:', requestData);

                // Process axios request with then() chain
                axios.put('/api/price/update', requestData)
                    .then(response => {
                        console.log("Update successful:", response.data);

                        // Call registration/edit API
                        return submitPriceData(data);
                    })
                    .then(() => {
                        console.log('Price data submitted successfully.');
                    })
                    .catch(error => {
                        console.error("Update failed or registration failed:", error);
                    });
            }
        });
    };

    // 🔴🔴🔴 insert/update(executed when write/edit complete button clicked)
    const onSubmit = async (data) => {
        // Check if data.priceCustomer is string, then store actual value with commas removed
        if (typeof data.priceCustomer === 'string') {
            data.priceCustomer = data.priceCustomer.replace(/,/g, '');
        } else {
            // If number or other type, convert to string then process
            data.priceCustomer = String(data.priceCustomer).replace(/,/g, '');
        }

        // 🔴 Duplicate data check API call
        try {
            const requestData = {
                customerNo: selectedCustomer.customerNo,
                productCd: selectedProduct.productCd,
                priceStartDate: data.priceStartDate,
                priceEndDate: data.priceEndDate
            };

            const duplicateCheckResponse = await axios.post('/api/price/check-duplicate', requestData);

            const duplicatePrices = duplicateCheckResponse.data; // Receive list of duplicate PriceDTOs

            // Duplicate check and processing logic
            console.log("(isEditMode && duplicatePrices.length > 1) : " + (isEditMode && duplicatePrices.length > 1));
            console.log("(!isEditMode && duplicatePrices.length > 0) : " + (!isEditMode && duplicatePrices.length > 0));
            console.log("duplicatePrices.length : " + duplicatePrices.length);
            if ((isEditMode && duplicatePrices.length > 1) || (!isEditMode && duplicatePrices.length > 0)) {
                // Add alert when multiple duplicate data exist
                if ((isEditMode && duplicatePrices.length > 2) || (!isEditMode && duplicatePrices.length > 1)) {
                    window.showToast(`Multiple data with overlapping periods exist. Please modify existing data.`, 'error');
                    return;
                }
                // Call function to handle duplicate data
                await handleDuplicateCheck(duplicatePrices, data.priceStartDate, data.priceEndDate, data);
                return;  // Stop update until confirm button is pressed in modal
            }

        } catch (error) {
            console.error('Duplicate check failed:', error);
            return;  // Stop saving if duplicate check fails
        }

        // Call registration/edit API directly if no duplicate data
        await submitPriceData(data);
    };

    // Registration and edit API call function
    const submitPriceData = async (data) => {
        try {

            console.log('🔴 data.priceCustomer', data.priceCustomer);
            const requestData = [
                {
                    customerNo: selectedCustomer.customerNo,
                    productCd: selectedProduct.productCd,
                    priceCustomer: parseInt(data.priceCustomer, 10),
                    priceStartDate: data.priceStartDate,
                    priceEndDate: data.priceEndDate
                }
            ];

            // Log request data
            console.log('🔴 Registration/Edit Request Data to be sent:', requestData);

            // Add priceNo in edit mode
            if (isEditMode) {
                requestData[0].priceNo = priceData.priceNo; // Add priceNo to first element of array
            }

            let response;
            if (isEditMode) {
                console.log('🔴 update');
                // Use PUT method in edit mode
                response = await axios.put(`/api/price/update`, requestData);
            } else {
                console.log('🔴 insert');
                // Use POST method for new additions
                response = await axios.post(`/api/price/insert`, requestData);
            }

            // Check response data
            console.log('🔴 Response Data:', response.data);

            // Call onSave on successful save
            onSave(data); // handleAddSave()

            // Reset customer, product, price information after save
            setSelectedCustomer({ customerName: 'Select Customer', customerNo: '' });
            setSelectedProduct({ productNm: 'Select Product', productCd: '', productPrice: 0 });
            setValue('priceCustomer', ''); // Reset price field
            setValue('priceStartDate', ''); // Reset start date field
            setValue('priceEndDate', ''); // Reset end date field
        } catch (error) {
            console.error('Insert/Update failed:', error);
        }
    };

    // 🟡 Handle customer selection
    useEffect(() => {
        setValue('selectedCustomerNo', selectedCustomer.customerNo, { shouldValidate: isSubmitted });
    }, [selectedCustomer, setValue, isSubmitted]);

    // 🟡🟡🟡 Handle product selection
    useEffect(() => {
        if (selectedProduct && selectedProduct.productCd) {
            console.log("selectedProductCd: " + selectedProduct.productCd);

            // Set product code
            setValue('selectedProductCd', selectedProduct.productCd, { shouldValidate: isSubmitted });

            // Set price (apply toLocaleString only if price is not undefined)
            if (selectedProduct.productPrice !== undefined && selectedProduct.productPrice !== null) {
                setValue('priceCustomer', selectedProduct.productPrice.toLocaleString(), { shouldValidate: isSubmitted });
            }
        }
    }, [selectedProduct, setValue, isSubmitted]);

    // 🟡🟡🟡 Maintain selected data values in edit mode
    useEffect(() => {
        if (isEditMode) {
            setSelectedCustomer({
                customerName: priceData.customerName,
                customerNo: priceData.customerNo,
            });
            setSelectedProduct({
                productNm: priceData.productNm,
                productCd: priceData.productCd,
                productPrice: priceData.productPrice,
            });

            // Set existing price
            setValue('priceCustomer', formatPriceWithComma(priceData.priceCustomer));
        }
    }, [isEditMode, priceData, setSelectedCustomer, setSelectedProduct, setValue]);

    // 🟡 Run validation when date is entered
    useEffect(() => {
        if (isSubmitted) {
            trigger('priceStartDate');
            trigger('priceEndDate');
        }
    }, [priceStartDate, priceEndDate, trigger, isSubmitted]);

    // 🟡 Apply comma to default values
    useEffect(() => {
        if (isEditMode && priceData.priceCustomer) {
            const formattedPrice = formatPriceWithComma(priceData.priceCustomer);
            setValue('priceCustomer', formattedPrice);
        }
    }, [isEditMode, priceData.priceCustomer, setValue]);

    // 🟢 Handle price input
    const handlePriceChange = (e) => {
        let value = e.target.value;

        // Convert to string then process
        if (typeof value !== 'string') {
            value = String(value);
        }

        value = value.replace(/,/g, ''); // Remove commas
        if (!isNaN(value) && parseInt(value, 10) >= 0) {
            value = parseInt(value, 10).toLocaleString(); // Add comma every three digits
        }

        setValue('priceCustomer', value, { shouldValidate: isSubmitted }); // Update value and run validation
    };

    // 🟢 Reset customer and product selection state when cancel button clicked
    const handleCancel = () => {
        setSelectedCustomer({ customerName: 'Select Customer', customerNo: '' }); // Reset customer selection information
        setSelectedProduct({ productNm: 'Select Product', productCd: '', productPrice: 0 });      // Reset product selection information
        onCancel(); // Cancel processing
    };

    // 🟢 Class application logic for regular fields
    const getFieldClass = (fieldError, fieldValue, isEditMode) => {
        if (fieldError) return 'field_error'; // When there's error
        if (isEditMode && !fieldError) return 'field_ok'; // Add 'ok' class when in edit mode and no error
        if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') return 'field_ok'; // Add 'ok' when value is entered
        return ''; // When no value
    };

    // Registration or edit tr
    return (
        <tr className='tr_input'>
            {/* Checkbox column */}
            <td>
                {isEditMode ? (
                    <label className="chkbox_label">
                        {priceData.priceDeleteYn !== 'Y' && (
                            <>
                                <input
                                    type="checkbox"
                                    className="chkbox"
                                    disabled={true}
                                />
                                <i className="chkbox_icon">
                                    <i className="bi bi-check-lg"></i>
                                </i>
                            </>
                        )}
                    </label>
                ) : (
                    '-'
                )}
            </td>
            {/* Number */}
            <td>
                {isEditMode ? (currentPage - 1) * itemsPerPage + index + 1 : '-'}
            </td>
            <td className="vat">
                {/* Customer search button */}
                <button
                    className={`box btn_search wp100 ${getFieldClass(errors.selectedCustomerNo, selectedCustomer.customerNo)}`}
                    onClick={() => setCustomerModalOpen(true)}
                >
                    {selectedCustomer.customerName || 'Select Customer'} {/* Display selected customer name */}
                    <i className="bi bi-search"></i>
                </button>
                {/* Store customer number in hidden input field */}
                <input
                    type="hidden"
                    {...register('selectedCustomerNo', { required: 'Please select a customer' })}
                    value={selectedCustomer.customerNo}
                />
                {errors.selectedCustomerNo && (
                    <p className="field_error_msg"><i className="bi bi-exclamation-circle-fill"></i>{errors.selectedCustomerNo.message}</p>
                )}
            </td>

            <td className="vat">
                {/* Product search button */}
                <button
                    className={`box btn_search wp100 ${getFieldClass(errors.selectedProductCd, selectedProduct.productCd)}`}
                    onClick={() => setProductModalOpen(true)}
                >
                    {selectedProduct.productNm || 'Select Product'}  {/* Display selected product name */}
                    <i className="bi bi-search"></i>
                </button>
                {/* Store product code in hidden input field */}
                <input
                    type="hidden"
                    {...register('selectedProductCd', { required: 'Please select a product' })}
                    value={selectedProduct.productCd}
                />
                {errors.selectedProductCd && (
                    <p className="field_error_msg"><i className="bi bi-exclamation-circle-fill"></i>{errors.selectedProductCd.message}</p>
                )}
            </td>
            <td className="vat">
                <div className="input-with-text">
                    <input
                        type="text"
                        // value={selectedProduct.productPrice}
                        className={`box price ${getFieldClass(errors.priceCustomer, priceCustomer)}`}
                        placeholder="0"
                        {...register('priceCustomer', {
                            required: 'Please enter price',
                            validate: (value) => {
                                // Convert value to string if not already
                                const stringValue = typeof value === 'string' ? value : String(value);
                                return parseInt(stringValue.replace(/,/g, ''), 10) > 0 || 'Price must be greater than 0';
                            }
                        })}
                        onInput={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                            e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add comma every three digits
                        }}
                        onChange={handlePriceChange}
                    />
                    <span>KRW</span>
                </div>
                {errors.priceCustomer && (
                    <p className="field_error_msg"><i className="bi bi-exclamation-circle-fill"></i>{errors.priceCustomer.message}</p>
                )}
            </td>
            <td className="vat">
                <input
                    type="date"
                    max="9999-12-31"
                    className={`box ${getFieldClass(errors.priceStartDate, priceStartDate, isEditMode)}`}
                    placeholder="Start date"
                    {...register('priceStartDate', {
                        required: 'Please enter start date',
                        validate: (value) => {
                            if (priceEndDate && new Date(value) > new Date(priceEndDate)) {
                                return 'Later than end date.';
                            }
                            return true;
                        },
                    })}
                />
                {errors.priceStartDate && (
                    <p className="field_error_msg">
                        <i className="bi bi-exclamation-circle-fill"></i>{errors.priceStartDate.message}
                    </p>
                )}
            </td>
            <td className="vat">
                <input
                    type="date"
                    max="9999-12-31"
                    className={`box ${getFieldClass(errors.priceEndDate, priceEndDate, isEditMode)}`}
                    placeholder="End date"
                    {...register('priceEndDate', {
                        required: 'Please enter end date',
                        validate: (value) => {
                            if (priceStartDate && new Date(value) < new Date(priceStartDate)) {
                                return 'Earlier than start date.';
                            }
                            return true;
                        },
                    })}
                />
                {errors.priceEndDate && (
                    <p className="field_error_msg">
                        <i className="bi bi-exclamation-circle-fill"></i>{errors.priceEndDate.message}
                    </p>
                )}
            </td>
            <td>
                {isEditMode ? (priceInsertDate ? format(new Date(priceInsertDate), 'yy-MM-dd HH:mm') : '-') : '-'}
            </td>
            <td>
                {isEditMode ? (priceUpdateDate ? format(new Date(priceUpdateDate), 'yy-MM-dd HH:mm') : '-') : '-'}
            </td>
            <td>-</td> {/* Deletion date/time */}
            <td>
                <div className='btn_group'>
                    <button
                        className="box color_border"
                        onClick={handleSubmit(onSubmit)} // Use react-hook-form's handleSubmit
                    >
                        {`${isEditMode ? 'Edit Complete' : 'Write Complete'}`}
                    </button>
                    <button className="box" onClick={handleCancel}>Cancel</button>
                </div>
            </td>
        </tr>
    );
};

export default PriceRow;