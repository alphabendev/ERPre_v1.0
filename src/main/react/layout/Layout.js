// src/main/react/layout/Layout.js
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../resources/static/css/common/Layout.css';
import Toast from '../components/common/Toast'; // Toast component
import ConfirmCustom from '../components/common/ConfirmCustom'; // confirm modal component

function Layout({currentMenu, children}) {

    return (
        <div className="container">
            <Header/>
            <div className="main-container">
                <Sidebar currentMenu={currentMenu}/>
                {children}
                <Toast /> {/* Toast message */}
                <ConfirmCustom /> {/* confirm modal */}
            </div>
        </div>
    );
}

export default Layout;