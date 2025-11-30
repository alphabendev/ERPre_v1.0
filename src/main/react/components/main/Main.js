import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import Layout from "../../layout/Layout";
import '../../../resources/static/css/common/Main.css';
import axios from 'axios';

function Main() {
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [recentCustomers, setRecentCustomers] = useState([]);
    const [renewalCustomers, setRenewalCustomers] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [recentHiresCount, setRecentHiresCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [last30DaysSales, setLast30DaysSales] = useState(0);
    const [orderStatusCount, setOrderStatusCount] = useState({
        ingCount: 0,
        approvedCount: 0,
        deniedCount: 0,
    });
    const [totalProductCount, setTotalProductCount] = useState(0);
    const [recentProductCount, setRecentProductCount] = useState(0);
    const [annualSales, setAnnualSales] = useState(0);
    const [settlementInfo, setSettlementInfo] = useState({
        approvedTotal: 0,
        deniedTotal: 0,
        settlementDeadline: '',
    });
    const [deletedEmployees, setDeletedEmployees] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const startTime = performance.now(); // Request start time
            try {
                const [
                    orderStatusResponse,
                    employeesResponse,
                    recentHiresResponse,
                    customersResponse,
                    productCountsResponse,
                    totalSalesResponse,
                    settlementResponse,
                    annualSalesResponse,
                    last30DaysSalesResponse,
                    recentCustomersResponse,
                    renewalCustomersResponse,
                    deletedEmployeesResponse
                ] = await Promise.all([
                    axios.get('/api/order/status/count'),
                    axios.get('/api/employeeCount'),
                    axios.get('/api/employeeRecentCount'),
                    axios.get('/api/customer/count'),
                    axios.get('/api/products/productCounts'),
                    axios.get('/api/totalSales'),
                    axios.get('/api/order/settlement'),
                    axios.get('/api/order/annual'),
                    axios.get('/api/order/lastMonth'),
                    axios.get('/api/customer/recent'),
                    axios.get('/api/customer/renewals'),
                    axios.get('/api/employeeCountDeleted')
                ]);

                const { ingCount, approvedCount, deniedCount } = orderStatusResponse.data;
                setOrderStatusCount({ ingCount, approvedCount, deniedCount });
                setOrderCount(ingCount + approvedCount + deniedCount);
                setTotalEmployees(employeesResponse.data);
                setRecentHiresCount(recentHiresResponse.data);
                setTotalCustomers(customersResponse.data);
                setTotalSales(totalSalesResponse.data || 0);
                const { totalProductCount, recentProductCount } = productCountsResponse.data;
                setTotalProductCount(totalProductCount);
                setRecentProductCount(recentProductCount);
                setAnnualSales(annualSalesResponse.data || 0);
                setLast30DaysSales(last30DaysSalesResponse.data || 0);

                // Handle potential null values in settlement data
                const settlementData = settlementResponse.data || {};
                setSettlementInfo({
                    approvedTotal: settlementData.approvedTotal ?? 0,
                    deniedTotal: settlementData.deniedTotal ?? 0,
                    settlementDeadline: settlementData.settlementDeadline || '',
                });

                setRecentCustomers(recentCustomersResponse.data);
                setRenewalCustomers(renewalCustomersResponse.data);
                setDeletedEmployees(deletedEmployeesResponse.data);

                const endTime = performance.now(); // Request end time
                const duration = endTime - startTime; // Calculate duration

                console.log(`Request duration: ${duration.toFixed(2)}ms`);

            } catch (error) {
                console.error("Error fetching data:", error);
                window.showToast("Failed to fetch data.", 'error');
            }
        };

        fetchData();
    }, []);

    return (
        <Layout currentMenu="main">
            <main className="main-content dashboard-container">
                <div className="card card-large" onClick={() => window.location.href = '/orderList?mode=Assigned'}>
                    <h3><i className="bi bi-bar-chart-line-fill"></i> Sales Management</h3>
                    <div className="info-group">
                        <p><i className="bi bi-clock-fill"></i> Pending Approval: {orderStatusCount.ingCount}</p>
                        <p><i className="bi bi-check-circle-fill"></i> Approved: {orderStatusCount.approvedCount}</p>
                        <p><i className="bi bi-x-circle-fill"></i> Denied: {orderStatusCount.deniedCount}</p>
                    </div>
                </div>
                <div className="card card-large" onClick={() => window.location.href = '/customerList'}>
                    <h3><i className="bi bi-building"></i> Customer Management</h3>
                    <div className="info-group">
                        <p><i className="bi bi-people-fill"></i> Total Customers: {totalCustomers.toLocaleString()}</p>
                        <p><i className="bi bi-person-add"></i> Recent New Customers: {recentCustomers.length.toLocaleString()}</p>
                        <p><i className="bi bi-arrow-clockwise"></i> Pending Renewals: {renewalCustomers.length.toLocaleString()}</p>
                    </div>
                </div>
                <div className="card card-large" onClick={() => window.location.href = '/employeeList'}>
                    <h3><i className="bi bi-people-fill"></i> Employee Management</h3>
                    <div className="info-group">
                        <p><i className="bi bi-person-circle"></i> Total Employees: {totalEmployees}</p>
                        <p><i className="bi bi-person-check-fill"></i> Recent Hires: {recentHiresCount}</p>
                        <p><i className="bi bi-person-x-fill"></i> Recent Departures: {deletedEmployees}</p>
                    </div>
                </div>
                <div className="card card-large" onClick={() => window.location.href = '/productList'}>
                    <h3><i className="bi bi-box-seam"></i> Product Management</h3>
                    <div className="info-group">
                        <p><i className="bi bi-box"></i> Total Products: {totalProductCount.toLocaleString()}</p>
                        <p><i className="bi bi-star-fill"></i> New Products: {recentProductCount.toLocaleString()}</p>
                        <p><i className="bi bi-box-seam"></i> Recent Sales: {totalSales.toLocaleString()}</p>
                        <p><i className="bi bi-list-check"></i> Monthly Revenue: ₩{last30DaysSales.toLocaleString()}</p>
                    </div>
                </div>
                <div className="image-container">
                    <img src="/img/cardimg.jpg" alt="Product Image" className="logo-image"/>
                    <img src="/img/cardimg2.jpg" alt="Product Image" className="logo-image"/>
                </div>
                <div className="card" onClick={() => window.location.href = '/orderReport'}>
                    <h3><i className="bi bi-graph-up-arrow"></i> Order Status</h3>
                    <div className="info-group">
                        <p><i className="bi bi-list-check"></i> Total Orders: {orderCount.toLocaleString()}</p>
                        <p><i className="bi bi-cash-coin"></i> Annual Revenue: ₩{annualSales.toLocaleString()}</p>
                        <p><i className="bi bi-check-all"></i> Annual Target Achievement: ₩{annualSales.toLocaleString()}/₩100,000,000
                            ({((annualSales / 100000000) * 100).toFixed(2)}%)</p>
                    </div>
                </div>
                <div className="card">
                    <h3><i className="bi bi-cash-coin"></i> Settlements</h3>
                    <div className="info-group">
                        <p><i className="bi bi-cash-stack"></i> Settlement Amount: ₩{(settlementInfo.approvedTotal ?? 0).toLocaleString()}</p>
                        <p><i className="bi bi-calendar-date"></i> Settlement Deadline: {settlementInfo.settlementDeadline || 'N/A'}</p>
                        <p><i className="bi bi-credit-card"></i> Outstanding Amount: ₩{(settlementInfo.deniedTotal ?? 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="card">
                    <h3><i className="bi bi-megaphone-fill"></i> Announcements</h3>
                    <div className="info-group">
                        <p><i className="bi bi-bell-fill"></i> New Event: SharedOne Company Visit</p>
                        <p><i className="bi bi-info-circle-fill"></i> Announcement Updated: September 26, 2024</p>
                        <p><i className="bi bi-calendar-event"></i> Next Meeting: September 27, 2024</p>
                    </div>
                </div>
            </main>
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Main/>
    </BrowserRouter>
);