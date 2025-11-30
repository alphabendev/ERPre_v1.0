import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../../../resources/static/css/sales/OrderReport.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function OrderReport() {
    const [chartData, setChartData] = useState(null);  // Set initial state to null
    const [startDate, setStartDate] = useState("");  // Default start date (String format)
    const [endDate, setEndDate] = useState("");      // Default end date (String format, current day of query)
    const [selectedOrderType, setSelectedOrderType] = useState('totalOrders'); // Store selected order type
    const [message, setMessage] = useState(''); // State variable to store message

    const defaultData = [0, 0, 0];  // Default value when there's no data (nothing on y-axis)

    // Set today's date as end date
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Calculate date range
    const calculateStartDate = (period) => {
        const today = new Date();
        let startDate;

        if (period === "3months") {
            today.setMonth(today.getMonth() - 2); // 3 months ago
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (period === "3halfYears") {
            today.setMonth(today.getMonth() - 17); // 18 months ago (3 half-years)
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (period === "3years") {
            startDate = new Date(today.getFullYear() - 2, 0, 1); // January 1, 3 years ago
        }

        return startDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
    };

    // Dynamically generate year/month to display on chart
    const generateLabels = (period) => {
        const today = new Date();
        const labels = [];

        if (period === "3months") {
            for (let i = 2; i >= 0; i--) {
                const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const year = targetMonth.getFullYear().toString().slice(-2); // Last 2 digits of year
                const month = targetMonth.getMonth() + 1; // Month (starts from 0, so +1)
                labels.push(`${year} Y ${month} M`);
            }
        } else if (period === "3halfYears") {
            const today = new Date();
            let currentYear = today.getFullYear();
            let currentHalf = today.getMonth() < 6 ? 1 : 2; // First half: 1, Second half: 2

            for (let i = 2; i >= 0; i--) {
                let half = currentHalf - i;
                let year = currentYear;

                while (half <= 0) {
                    half += 2;
                    year -= 1;
                }

                const halfLabel = half === 1 ? 'H1' : 'H2';
                labels.push(`${year} ${halfLabel}`);
            }
        } else if (period === "3years") {
            for (let i = 2; i >= 0; i--) {
                const year = today.getFullYear() - i; // Last 3 years
                labels.push(`${year}`);
            }
        }

        return labels;
    };

    // 🔴 Total order count API call
    const fetchTotalOrders = (period) => {

        const today = getTodayDate();
        const calculatedStartDate = calculateStartDate(period);

        let apiUrl = `/api/orderReport/orders?periodType=monthly`; // By default, call last 3 months order count
        if (period === "3months") {
            apiUrl = `/api/orderReport/orders?periodType=monthly`; // Last 3 months
        } else if (period === "3halfYears") {
            apiUrl = `/api/orderReport/orders?periodType=halfyearly`; // Last 3 half-years
        } else if (period === "3years") {
            apiUrl = `/api/orderReport/orders?periodType=yearly`; // Last 3 years
        }

        // 🔴 API request
        axios.get(apiUrl, {
            params: { startDate: calculatedStartDate, endDate: today }
        })
            .then(response => {
                console.log("API response:", response.data);  // Check response data structure
                console.log("Response data type:", typeof response.data); // Check response data type

                let processedData = { counts: [], amounts: [] };  // Store order count and amount separately
                const currentMonth = new Date().getMonth() + 1;  // Current month (starts from 1)
                const currentYear = new Date().getFullYear(); // Current year

                if (period === "3months") {
                    // Process last 3 months data
                    processedData = { counts: [0, 0, 0], amounts: [0, 0, 0] };  // Initial value

                    response.data.forEach(([month, count, totalAmount]) => {
                        const monthDiff = currentMonth - month;  // Calculate difference between current month and response month
                        if (monthDiff === 2) {
                            processedData.counts[0] = count;  // Count from 2 months ago
                            processedData.amounts[0] = totalAmount;  // Amount from 2 months ago
                        } else if (monthDiff === 1) {
                            processedData.counts[1] = count;  // Last month count
                            processedData.amounts[1] = totalAmount;  // Last month amount
                        } else if (monthDiff === 0) {
                            processedData.counts[2] = count;  // This month count
                            processedData.amounts[2] = totalAmount;  // This month amount
                        }
                    });
                } else if (period === "3halfYears") {
                    // Process last 3 half-years data
                    processedData = { counts: [0, 0, 0], amounts: [0, 0, 0] };  // Initial value

                    const labels = generateLabels(period); // Generate labels

                    // Create object to map labels and data
                    const labelMap = {};
                    labels.forEach((label, index) => {
                        labelMap[label] = index; // e.g., {'2023 H2': 0, '2024 H1': 1, '2024 H2': 2}
                    });

                    response.data.forEach(([halfYear, year, count, totalAmount]) => {
                        const halfLabel = halfYear === 'FirstHalf' ? 'H1' : 'H2';
                        const label = `${year} ${halfLabel}`;

                        const index = labelMap[label];
                        if (index !== undefined) {
                            processedData.counts[index] = count;
                            processedData.amounts[index] = totalAmount;
                        }
                    });
                } else if (period === "3years") {
                    // Process last 3 years data
                    processedData = { counts: [0, 0, 0], amounts: [0, 0, 0] };  // Initial value

                    response.data.forEach(([year, count, totalAmount]) => {
                        const yearDiff = currentYear - year;  // Calculate difference between current year and response year
                        if (yearDiff === 2) {
                            processedData.counts[0] = count;  // Count from 2 years ago
                            processedData.amounts[0] = totalAmount;  // Amount from 2 years ago
                        } else if (yearDiff === 1) {
                            processedData.counts[1] = count;  // Count from 1 year ago
                            processedData.amounts[1] = totalAmount;  // Amount from 1 year ago
                        } else if (yearDiff === 0) {
                            processedData.counts[2] = count;  // Current year count
                            processedData.amounts[2] = totalAmount;  // Current year amount
                        }
                    });
                }

                // Dynamically generate values to display on chart (call generateLabels above)
                const labels = generateLabels(period);

                // 🔴 Set chart data and options -> Use dual Y-axis in Chart.js to display order count and total amount in balance on the same chart
                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Total Order Count',
                            data: processedData.counts,  // Order count data
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            yAxisID: 'y-orders'  // Order count Y-axis
                        },
                        {
                            label: 'Total Order Amount',
                            data: processedData.amounts,  // Order amount data
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                            yAxisID: 'y-amounts'  // Order amount Y-axis
                        }
                    ]
                });

            })
            .catch(error => {
                console.error('Total order count API call error:', error.response || error);
                // Initialize chart data on error to hide chart
                setChartData(null);
                console.log('Failed to load chart. Please try again later.');
            });

    };

    // Fetch order filter data
    const fetchOrdersByFilter = (filterType) => {
        const startDate = calculateStartDate("3months");
        const endDate = getTodayDate();

        axios.get(`/api/orderReport/ordersByFilter`, {
            params: { filterType, startDate, endDate }
        })
            .then(response => {
                const processedData = {
                    counts: response.data.map(item => item[1]), // Order count
                    amounts: response.data.map(item => item[2]) // Order amount
                };

                const labels = response.data.map(item => item[0]); // Manager, customer, product name

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Total Order Count',
                            data: processedData.counts,  // Order count data
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            yAxisID: 'y-orders'  // Order count Y-axis
                        },
                        {
                            label: 'Total Order Amount',
                            data: processedData.amounts,  // Order amount data
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                            yAxisID: 'y-amounts'  // Order amount Y-axis
                        }
                    ]
                });
            })
            .catch(error => {
                console.error('API error:', error.response || error);
                setChartData(null);
            });
    };

    // Handle date change by period
    const handleDateRangeChange = (e) => {
        const value = e.target.value;
        setStartDate(calculateStartDate(value)); // Set start date dynamically
        setEndDate(getTodayDate()); // Set today's date as end date
        fetchTotalOrders(value); // Fetch order data for new period
    };

    // Call appropriate API based on radio button value
    const handleOrderTypeChange = (e) => {
        const value = e.target.value;
        setSelectedOrderType(value);
        setChartData(null); // Remove chart to display blank screen
        setMessage('');     // Initialize message

        if (value === 'totalOrders') {
            fetchTotalOrders("3months");
        } else {
            fetchOrdersByFilter(value);
        }
    };

    // Load total order count on first render
    useEffect(() => {
        fetchTotalOrders("3months"); // Initially load total order count data
    }, []);

    return (
        <Layout currentMenu="orderReport">
            <main className="main-content menu_order_report">
                <div className="menu_title">
                    <div className="sub_title">Sales Management</div>
                    <div className="main_title">Order Status Report</div>
                </div>
                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            <div className="radio_box">
                                <span>Category</span>
                                <input
                                    type="radio"
                                    id="totalOrders"
                                    name="orderType"
                                    value="totalOrders"
                                    onChange={handleOrderTypeChange}
                                    checked={selectedOrderType === 'totalOrders'}
                                />
                                <label htmlFor="totalOrders">All</label>
                                <input
                                    type="radio"
                                    id="employeeOrders"
                                    name="orderType"
                                    value="employeeOrders"
                                    onChange={handleOrderTypeChange}
                                    checked={selectedOrderType === 'employeeOrders'}
                                />
                                <label htmlFor="employeeOrders">By Manager</label>
                                <input
                                    type="radio"
                                    id="customerOrders"
                                    name="orderType"
                                    value="customerOrders"
                                    onChange={handleOrderTypeChange}
                                    checked={selectedOrderType === 'customerOrders'}
                                />
                                <label htmlFor="customerOrders">By Customer</label>
                                <input
                                    type="radio"
                                    id="productOrders"
                                    name="orderType"
                                    value="productOrders"
                                    onChange={handleOrderTypeChange}
                                    checked={selectedOrderType === 'productOrders'}
                                />
                                <label htmlFor="productOrders">By Product</label>
                            </div>
                        </div><div className="right">
                        {selectedOrderType === 'totalOrders' && (
                            <select className='box' onChange={handleDateRangeChange}>
                                <option value="3months">Last 3 Months</option>
                                <option value="3halfYears">Last 3 Half-Years</option>
                                <option value="3years">Last 3 Years</option>
                            </select>
                        )}
                    </div>
                    </div>

                    <div className="table_wrap">
                        {chartData ? (
                            <Bar data={chartData} options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: {
                                        display: true,
                                        text: selectedOrderType === 'employeeOrders'
                                            ? 'Order Status by Manager (Last 3 Months)'
                                            : selectedOrderType === 'customerOrders'
                                                ? 'Order Status by Customer (Last 3 Months)'
                                                : selectedOrderType === 'productOrders'
                                                    ? 'Order Status by Product (Last 3 Months)'
                                                    : 'Total Order Status' // Default
                                    }
                                },
                                scales: {
                                    yOrders: {
                                        type: 'linear',
                                        position: 'left',
                                        display: false,
                                        title: { display: true, text: 'Total Order Count' },
                                        ticks: { beginAtZero: true }
                                    },
                                    yAmounts: {
                                        type: 'linear',
                                        position: 'right',
                                        display: false,
                                        title: { display: true, text: 'Total Order Amount' },
                                        ticks: { beginAtZero: true },
                                        grid: { drawOnChartArea: false }
                                    }
                                }
                            }} />
                        ) : (
                            <div className="loading">
                                <span></span> {/* First circle */}
                                <span></span> {/* Second circle */}
                                <span></span> {/* Third circle */}
                            </div>
                        )}
                    </div>

                </div>

            </main>
        </Layout>
    );
}

// Root page JS is processed to be inserted into root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <OrderReport />
    </BrowserRouter>
);

export default OrderReport;