import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'; // Use ReactDOM to render React components to the DOM
import '../../../resources/static/css/common/Layout.css';
import '../../../resources/static/css/common/Login.css'; // Apply individual CSS styles

function Login() {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadRecaptchaScript = () => {
            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('reCAPTCHA script loaded');
            };
            document.body.appendChild(script);
        };

        loadRecaptchaScript();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form submission

        const captchaToken = window.grecaptcha.getResponse(); // Get CAPTCHA token
        if (!captchaToken) {
            setError('You must complete the CAPTCHA.');
            return;
        }

        try {
            console.log('Attempting login with:', { employeeId: id, employeePw: pw }); // Debug log

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employeeId: id, employeePw: pw }),
                credentials: 'include'  // Send cookies to server
            });

            console.log('Response status:', response.status); // Debug log

            const result = await response.json();

            if (response.ok) {
                console.log('Login successful:', result); // Debug log
                // Save current login time
                localStorage.setItem('loginTime', new Date().toLocaleString());
                location.href = "/main";
            } else {
                console.log('Login failed:', result); // Debug log
                setError(result.message || 'Login failed.');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Failed to connect to the server.');
        }
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(/img/logo_background.jpg)` }}>
            <div className="login-box">
                <div className="login-header">
                    <img src="/img/logo3.png" alt="IKEA Logo" className="logo" />
                    <h1>IKEA ERP Admin System</h1>
                </div>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="id">ID</label>
                        <input
                            type="text"
                            id="id"
                            placeholder="Enter your ID"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="pw">Password</label>
                        <input
                            type="password"
                            id="pw"
                            placeholder="Enter your password"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="recaptcha-container">
                        <div className="g-recaptcha" data-sitekey="6Lf6TlAqAAAAAD4ezvbWZJj2TGc8_WusXNm9D2f7"></div>
                    </div>
                    <button type="submit" className="login-btn">Login</button>
                </form>
                <div className="login-footer">
                    <a href="#">Reset Password</a> | <a href="#">Two-Factor Authentication Info</a>
                    <p>This system is IKEA property and only authorized users may access it.</p>
                    <p>COPYRIGHT © IKEA. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Login />
);
