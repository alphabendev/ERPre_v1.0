import React from 'react';
import '../../resources/static/css/common/Footer.css';

function Footer() {

    return (
        <footer>
            <div className="container-footer">
                <div className="info-area">
                    <ul>
                        <li>
                            <a href="#">Notice</a>
                        </li>
                        <li>
                            <a href="#">HR Management</a>
                        </li>
                        <li>
                            <a href="#">Sales Management</a>
                        </li>
                        <li>
                            <a href="#">Product Management</a>
                        </li>
                        <li>
                            <a href="#">Terms of Service</a>
                        </li>
                    </ul>
                </div>
                <div className="copyright-area">
                    <p>IKEA ERP Corporation | CEO: EREP:RE | 112-119 Banpo-dong, Gangnam-gu, Seoul | Tel: 02-1234-5678</p>
                    <p>Business Registration Number: 123-45-67890 | Online Business Registration: No. 1234-5678 | Privacy Officer: Han Jeong-woo</p>
                </div>
                <span className="copyright">Copyright 2024 IKEA© All rights reserved.</span>
            </div>
        </footer>
    );
}

export default Footer;