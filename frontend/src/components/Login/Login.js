import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => { 
    
    // --- STATE & LOGIC ---
    const [loginDetails, setLoginDetails] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false); // <--- NEW STATE
    const [isNavigating, setIsNavigating] = useState(false);
    const navigate = useNavigate();

    // --- NEW: UNIVERSAL TRANSITION HANDLER ---
    const handleTransition = (path) => {
        setIsNavigating(true); // 1. Start Animation
        
        // 2. Wait 1 second
        setTimeout(() => {
            navigate(path);
        }, 1000); 
    };

    const { email, password } = loginDetails;

    // --- HANDLERS ---
    const onInputChange = (e) => {
        setError(''); 
        setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
    };

    const onFormSubmit = async (e) => {
        e.preventDefault(); 
        setError('');

        try {
            const response = await axios.post("http://localhost:8081/login", loginDetails, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.message === "Login Successful") {
                // SAVE THE TOKEN AND ID
                localStorage.setItem('userId', response.data.id);
                localStorage.setItem('token', response.data.token); // <--- CRITICAL
                localStorage.setItem('userRole', response.data.role);
                localStorage.setItem('userFirstName', response.data.firstname);
                
                // --- SUCCESS HANDLING ---
                setIsSuccess(true); 
                setTimeout(() => navigate('/user-profile'), 3000);
            } else {
                setError("Login failed. Please check your credentials.");
            }

        } catch (err) {
            console.error("Login attempt failed:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "Invalid email or password.";
            setError(errorMessage);
        }
    };

    // --- STYLES (Premium Black & White) ---
    const styles = {
        container: {
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden'
        },
        leftSide: {
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2rem 5rem',
            position: 'relative' // Needed for transitions
        },
        rightSide: {
            backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
            position: 'relative',
        },
        overlay: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: '2rem',
            textAlign: 'center'
        },
        successContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            animation: 'fadeIn 0.5s ease-in-out'
        },
        input: {
            borderRadius: '0',
            border: '1px solid #ccc',
            padding: '12px',
            backgroundColor: '#f8f9fa'
        },
        button: {
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '0',
            padding: '12px',
            fontWeight: '600',
            letterSpacing: '1px',
            border: 'none',
            transition: 'all 0.3s ease'
        },
        link: {
            color: '#000',
            textDecoration: 'underline',
            fontWeight: 'bold'
        },

        // NEW: Loader Overlay Styles
        loaderOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // White with opacity
            backdropFilter: 'blur(8px)', // Frosted Glass
            zIndex: 10000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
        }
    };

    return (
        <div className="container-fluid" style={styles.container}>
            
            {/* --- INJECT CSS ANIMATION --- */}
            <style>{`
                .wave-loader {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .wave-dot {
                    width: 15px;
                    height: 15px;
                    margin: 0 5px;
                    background-color: #000; /* Black dots */
                    border-radius: 50%;
                    animation: wave 1.2s infinite ease-in-out both;
                }
                .wave-dot:nth-child(1) { animation-delay: -1.1s; }
                .wave-dot:nth-child(2) { animation-delay: -1.0s; }
                .wave-dot:nth-child(3) { animation-delay: -0.9s; }
                .wave-dot:nth-child(4) { animation-delay: -0.8s; }
                .wave-dot:nth-child(5) { animation-delay: -0.7s; }
                
                @keyframes wave {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
            <div className="row h-100">
                
                {/* --- LEFT SIDE: Form or Success --- */}
                <div className="col-lg-6 col-md-12" style={styles.leftSide}>
                    
                    {/* CONDITIONAL RENDERING */}
                    {isSuccess ? (
                        <div style={styles.successContainer}>
                            {/* Animated Checkmark */}
                            <div className="mb-4" style={{
                                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#000', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            
                            <h2 className="display-6 fw-bold text-black text-uppercase mb-3" style={{ letterSpacing: '-1px' }}>
                                Access Granted
                            </h2>
                            <p className="text-muted text-center mb-4" style={{ maxWidth: '400px' }}>
                                Credentials verified. Establishing secure connection to your dashboard...
                            </p>
                            
                            {/* Loading Bar */}
                            <div style={{ width: '200px', height: '2px', backgroundColor: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ 
                                    position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', 
                                    backgroundColor: '#000', animation: 'progress 3s linear' 
                                }}></div>
                            </div>
                            
                            {/* CSS Animation */}
                            <style>
                                {`
                                    @keyframes progress { from { width: 0%; } to { width: 100%; } }
                                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                                `}
                            </style>
                        </div>
                    ) : (
                        // STANDARD FORM VIEW
                        <div className="mx-auto" style={{ maxWidth: '450px', width: '100%' }}>
                            
                            {/* Header Section */}
                            <div className="mb-5 text-start">
                                <span className="badge bg-dark mb-2 rounded-0">SECURE ACCESS</span>
                                <h2 className="display-5 fw-bold mb-1" style={{ letterSpacing: '-1px' }}>Log In</h2>
                                <p className="text-muted">Enter your credentials to access the dashboard.</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-dark rounded-0 border-0 mb-4 d-flex align-items-center" role="alert">
                                    <span className="me-2">⚠️</span> {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={onFormSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label text-uppercase small fw-bold text-secondary" style={{ letterSpacing: '1px' }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control shadow-none"
                                        style={styles.input}
                                        placeholder="name@company.com"
                                        name="email"
                                        value={email}
                                        onChange={onInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="password" className="form-label text-uppercase small fw-bold text-secondary" style={{ letterSpacing: '1px' }}>
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control shadow-none"
                                        style={styles.input}
                                        placeholder="••••••••"
                                        name="password"
                                        value={password}
                                        onChange={onInputChange}
                                        required
                                    />
                                </div>

                                <div className="d-grid mb-4">
                                    <button 
                                        type="submit" 
                                        className="btn btn-dark shadow-lg" 
                                        style={styles.button}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#000'}
                                    >
                                        AUTHENTICATE
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-4">
                                <p className="small text-muted">
                                    Don't have an account? 
                                    <span
                                        className="ms-2 text-black fw-bold"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleTransition('/register-user')}
                                    >
                                        Register Here
                                    </span>
                            
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- RIGHT SIDE: Image (Static) --- */}
                <div className="col-lg-6 d-none d-lg-block p-0" style={{ height: '100vh', overflow: 'hidden' }}>
                    <div style={styles.rightSide} className="h-100 w-100">
                        <div style={styles.overlay}>
                            <h1 className="display-4 fw-bold mb-4" style={{ letterSpacing: '-1px' }}>
                                Welcome to Inventory Management
                            </h1>
                            <hr style={{ width: '60px', border: '2px solid white', opacity: '1', margin: '0 auto 2rem auto' }} />
                            <figure className="text-center">
                                <blockquote className="blockquote text-white fs-4 fst-italic">
                                    "Efficiency is doing things right; effectiveness is doing the right things."
                                </blockquote>
                                <figcaption className="blockquote-footer text-light mt-2">
                                    Peter Drucker
                                </figcaption>
                            </figure>
                        </div>
                    </div>
                </div>

                {/* --- ANIMATION OVERLAY --- */}
                {isNavigating && (
                    <div style={styles.loaderOverlay}>
                        <div className="wave-loader">
                            <div className="wave-dot"></div>
                            <div className="wave-dot"></div>
                            <div className="wave-dot"></div>
                            <div className="wave-dot"></div>
                            <div className="wave-dot"></div>
                        </div>
                        <div className="mt-4 text-dark small fw-bold text-uppercase" style={{letterSpacing: '2px'}}>Processing Request</div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Login;