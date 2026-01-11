import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    // --- CONFIG ---
    // Define your secret code here
    const MASTER_ADMIN_KEY = "NEXUS-2025";

    // --- STATE & LOGIC ---
    const [user, setUser] = useState({
        userid: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        type: "USER", // Default to USER
        userimg: "" // Add userimg field
    });

    // Generate unique user ID on component mount
    useEffect(() => {
        // Generate a unique user ID (RGSC + timestamp + random 4 digits)
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4 digits
        const userId = `RGSC-${timestamp}${randomNum}`;
        setUser(prevUser => ({
            ...prevUser,
            userid: userId
        }));
    }, []);

    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false); // <--- NEW STATE
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [adminCode, setAdminCode] = useState(""); // <--- New State for the code
    const [isNavigating, setIsNavigating] = useState(false); // <--- ANIMATION STATE
    const navigate = useNavigate();

    // --- ANIMATION LOGIC ---
    const handleTransition = (path) => {
        setIsNavigating(true); // 1. Start the Wave Animation

        // 2. Wait 1 second, then go to the page
        setTimeout(() => {
            navigate(path);
        }, 1000);
    };

    const { firstname, lastname, email, password, phone, address, type } = user;

    // --- VALIDATION FUNCTIONS (Preserved) ---
    const validateFirstname = () => {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!firstname.trim()) setFieldErrors(prev => ({ ...prev, firstname: "First name is required." }));
        else if (!nameRegex.test(firstname)) setFieldErrors(prev => ({ ...prev, firstname: "Letters only." }));
        else setFieldErrors(prev => ({ ...prev, firstname: "" }));
    };

    const validateLastname = () => {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!lastname.trim()) setFieldErrors(prev => ({ ...prev, lastname: "Last name is required." }));
        else if (!nameRegex.test(lastname)) setFieldErrors(prev => ({ ...prev, lastname: "Letters only." }));
        else setFieldErrors(prev => ({ ...prev, lastname: "" }));
    };

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) setFieldErrors(prev => ({ ...prev, email: "Email is required." }));
        else if (!emailRegex.test(email)) setFieldErrors(prev => ({ ...prev, email: "Invalid email address." }));
        else setFieldErrors(prev => ({ ...prev, email: "" }));
    };

    const validatePassword = () => {
        if (!password) setFieldErrors(prev => ({ ...prev, password: "Password is required." }));
        else if (password.length < 6) setFieldErrors(prev => ({ ...prev, password: "Min 6 characters." }));
        else setFieldErrors(prev => ({ ...prev, password: "" }));
    };

    const validatePhone = () => {
        const phoneRegex = /^(\+94|0)[0-9]{9}$/;
        if (!phone.trim()) setFieldErrors(prev => ({ ...prev, phone: "Phone is required." }));
        else if (!phoneRegex.test(phone)) setFieldErrors(prev => ({ ...prev, phone: "Format: 077... or +9477..." }));
        else setFieldErrors(prev => ({ ...prev, phone: "" }));
    };

    const validateAddress = () => {
        if (!address.trim()) setFieldErrors(prev => ({ ...prev, address: "Address is required." }));
        else setFieldErrors(prev => ({ ...prev, address: "" }));
    };

    const validateType = () => {
        if (!type) setFieldErrors(prev => ({ ...prev, type: "User type is required." }));
        else setFieldErrors(prev => ({ ...prev, type: "" }));
    };

    const onInputChange = (e) => {
        setError('');
        setFieldErrors(prev => ({ ...prev, [e.target.name]: "" }));
        setUser({ ...user, [e.target.name]: e.target.value });
        // Live validation
        switch (e.target.name) {
            case 'firstname':
                validateFirstname();
                break;
            case 'lastname':
                validateLastname();
                break;
            case 'email':
                validateEmail();
                break;
            case 'password':
                validatePassword();
                break;
            case 'phone':
                validatePhone();
                break;
            case 'address':
                validateAddress();
                break;
            case 'type':
                validateType();
                setAdminCode(""); // Clear code if they switch types
                break;
            // userid is auto-generated, so no validation needed
            default:
                break;
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setFileError("Please upload a JPG, PNG, or GIF image.");
                setSelectedFile(null);
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setFileError("File size must be less than 5MB.");
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
            setFileError("");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 🔒 SECURITY CHECK
        if (type === "ADMIN") {
            if (adminCode !== MASTER_ADMIN_KEY) {
                setError("❌ Access Denied: Incorrect Administrator Master Key.");
                return; // STOP HERE. Do not send data to backend.
            }
        }

        const hasErrors = Object.values(fieldErrors).some(error => error !== '');
        // Note: userid is auto-generated, so we don't need to check it
        const hasEmptyFields = [firstname, lastname, email, password, phone, address, type].some(val => val === "");

        if (hasErrors || hasEmptyFields) {
            setError("Please fill all fields correctly.");
            return;
        }

        try {
            // Upload image if selected
            let userImageName = ""; // Default empty

            if (selectedFile) {
                const formDataImage = new FormData();
                formDataImage.append("file", selectedFile);

                const imgUploadResponse = await axios.post("http://localhost:8081/user/userImg", formDataImage, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (imgUploadResponse.data.startsWith("Error")) {
                    throw new Error(imgUploadResponse.data);
                }

                userImageName = imgUploadResponse.data;
            }

            // Update user data with user image
            const updatedUser = {
                ...user,
                userimg: userImageName
            };

            await axios.post("http://localhost:8081/register", updatedUser, {
                headers: { 'Content-Type': 'application/json' }
            });

            // --- SUCCESS HANDLING ---
            setIsSuccess(true); // Trigger Success View

            // Wait 3 seconds then redirect to login
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error("Registration failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Server error occurred.");
        }
    };

    // --- STYLES (Black & White Premium) ---
    const styles = {
        container: {
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden'
        },
        imageSide: {
            backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
            position: 'relative',
        },
        overlay: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            color: 'white',
            textAlign: 'center'
        },
        formSide: {
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2rem 4rem',
            height: '100vh',
            overflowY: 'auto',
            position: 'relative' // Needed for smooth transition
        },
        successContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            animation: 'fadeIn 0.5s ease-in-out'
        },
        input: {
            borderRadius: '0',
            border: '1px solid #ccc',
            padding: '10px 12px',
            backgroundColor: '#f8f9fa',
            fontSize: '0.95rem',
            resize: 'none',
            // overflow: 'hidden',
        },
        label: {
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '1px',
            color: '#6c757d',
            marginBottom: '6px'
        },
        errorText: {
            fontSize: '0.75rem',
            color: '#dc3545',
            marginTop: '4px',
            fontWeight: '500'
        },
        button: {
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '0',
            padding: '14px',
            fontWeight: '600',
            letterSpacing: '1px',
            border: 'none',
            transition: 'all 0.3s ease',
            width: '100%'
        },
        loaderOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }
    };

    return (
        <div className="container-fluid p-0" style={styles.container}>
            {/* CSS Animation Styles */}
            <style>
                {`
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
                @keyframes progress { 
                    from { width: 0%; } 
                    to { width: 100%; } 
                }

                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                `}
            </style>
            <div className="row g-0 h-100">

                {/* --- LEFT SIDE: Image & Branding --- */}
                <div className="col-lg-5 d-none d-lg-block" style={{ height: '100vh' }}>
                    <div style={styles.imageSide} className="h-100 w-100">
                        <div style={styles.overlay}>
                            <h1 className="display-4 fw-bold mb-4" style={{ letterSpacing: '-2px' }}>
                                Join the Network
                            </h1>
                            <div style={{ width: '50px', height: '2px', background: 'white', marginBottom: '2rem' }}></div>
                            <p className="fs-5 fw-light fst-italic">
                                "Innovation distinguishes between a leader and a follower."
                            </p>
                            <p className="small text-white-50 mt-2">- Steve Jobs</p>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: Form or Success --- */}
                <div className="col-lg-7 col-md-12" style={styles.formSide}>

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
                                Account Created
                            </h2>
                            <p className="text-muted text-center mb-4" style={{ maxWidth: '400px' }}>
                                Your profile has been successfully registered in the system. Redirecting you to the secure login portal...
                            </p>

                            {/* Loading Bar */}
                            <div style={{ width: '200px', height: '2px', backgroundColor: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'absolute', left: 0, top: 0, height: '100%', width: '100%',
                                    backgroundColor: '#000', animation: 'progress 3s linear'
                                }}></div>
                            </div>


                        </div>
                    ) : (
                        // STANDARD FORM VIEW
                        <div className="mx-auto w-100" style={{ maxWidth: '600px', marginTop: '2rem' }}>

                            <div className="mb-4">
                                <span className="badge bg-dark rounded-0 mb-2">NEW ACCOUNT</span>
                                <h2 className="display-6 fw-bold text-black" style={{ letterSpacing: '-1px' }}>Create Profile</h2>
                                <p className="text-muted small">Fill in your details to register for the inventory system.</p>
                            </div>

                            {/* Global Error Alert */}
                            {error && (
                                <div className="alert alert-dark rounded-0 border-0 mb-4 p-3 small" role="alert">
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={onSubmit}>

                                {/* Profile Image Upload */}
                                <div className="text-center mb-4">
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f0f0f0',
                                        margin: '0 auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        border: '2px solid #dee2e6'
                                    }}>
                                        {selectedFile ? (
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Profile Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ color: '#6c757d', fontSize: '0.8rem' }}>No Image</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <label htmlFor="userImage" className="btn btn-outline-dark btn-sm" style={{ borderRadius: '0', fontSize: '0.8rem' }}>
                                            Upload Photo
                                        </label>
                                        <input
                                            type="file"
                                            id="userImage"
                                            style={{ display: 'none' }}
                                            onChange={onFileChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    {fileError && <div className="text-danger small mt-1">{fileError}</div>}
                                </div>

                                {/* Row 1: User Id */}
                                <div className="row mb-3">
                                    <div className="col-md-12 mb-3 mb-md-0">
                                        <label htmlFor="userid" style={styles.label}>User ID</label>
                                        <input
                                            type="text"
                                            className="form-control shadow-none"
                                            style={{ ...styles.input, backgroundColor: '#e9ecef' }}
                                            placeholder="Auto-generated"
                                            name="userid"
                                            value={user.userid}
                                            readOnly
                                        />
                                        <div className="form-text small mt-1 text-success opacity-75">System-Generated ID (cannot be changed)</div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label htmlFor="firstname" style={styles.label}>First Name</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-none ${fieldErrors.firstname ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            placeholder="John"
                                            name="firstname"
                                            value={firstname}
                                            onChange={onInputChange}
                                            onBlur={validateFirstname}
                                        />
                                        {fieldErrors.firstname && <div style={styles.errorText}>{fieldErrors.firstname}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="lastname" style={styles.label}>Last Name</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-none ${fieldErrors.lastname ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            placeholder="Doe"
                                            name="lastname"
                                            value={lastname}
                                            onChange={onInputChange}
                                            onBlur={validateLastname}
                                        />
                                        {fieldErrors.lastname && <div style={styles.errorText}>{fieldErrors.lastname}</div>}
                                    </div>
                                </div>

                                {/* Row 2: Contact */}
                                <div className="row mb-3">
                                    <div className="col-md-7 mb-3 mb-md-0">
                                        <label htmlFor="email" style={styles.label}>Email Address</label>
                                        <input
                                            type="email"
                                            className={`form-control shadow-none ${fieldErrors.email ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            placeholder="john.doe@company.com"
                                            name="email"
                                            value={email}
                                            onChange={onInputChange}
                                            onBlur={validateEmail}
                                        />
                                        {fieldErrors.email && <div style={styles.errorText}>{fieldErrors.email}</div>}
                                    </div>
                                    <div className="col-md-5">
                                        <label htmlFor="phone" style={styles.label}>Phone</label>
                                        <input
                                            type="tel"
                                            className={`form-control shadow-none ${fieldErrors.phone ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            placeholder="0771234567"
                                            name="phone"
                                            value={phone}
                                            onChange={onInputChange}
                                            onBlur={validatePhone}
                                        />
                                        {fieldErrors.phone && <div style={styles.errorText}>{fieldErrors.phone}</div>}
                                    </div>
                                </div>

                                {/* Row 3: Password & Type */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label htmlFor="password" style={styles.label}>Password</label>
                                        <input
                                            type="password"
                                            className={`form-control shadow-none ${fieldErrors.password ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            placeholder="••••••••"
                                            name="password"
                                            value={password}
                                            onChange={onInputChange}
                                            onBlur={validatePassword}
                                        />
                                        {fieldErrors.password && <div style={styles.errorText}>{fieldErrors.password}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="type" style={styles.label}>User Role</label>
                                        <select
                                            className={`form-select shadow-none ${fieldErrors.type ? 'is-invalid border-danger' : ''}`}
                                            style={{ ...styles.input, appearance: 'none' }}
                                            name="type"
                                            value={type}
                                            onChange={(e) => {
                                                onInputChange(e);
                                                setAdminCode(""); // Clear code if they switch types
                                                setError("");     // Clear errors
                                            }}
                                            onBlur={validateType}
                                        >
                                            <option value="">Select Role</option>
                                            <option value="USER">Standard User</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                        {fieldErrors.type && <div style={styles.errorText}>{fieldErrors.type}</div>}
                                    </div>
                                </div>

                                {/* --- 🔒 SECRET KEY INPUT (Only visible if ADMIN is selected) --- */}
                                {type === "ADMIN" && (
                                    <div className="mb-3 p-3 bg-light border border-warning rounded">
                                        <label className="form-label text-warning fw-bold small">
                                            🔒 ENTER MASTER ADMIN KEY
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control shadow-none border-warning"
                                            placeholder="Required for Admin Access"
                                            value={adminCode}
                                            onChange={(e) => {
                                                setAdminCode(e.target.value);
                                                setError(""); // Clear errors when typing
                                            }}
                                        />
                                        <div className="form-text text-danger opacity-75" style={{ fontSize: '0.7rem' }}>
                                            Restricted to authorized personnel only.
                                        </div>
                                    </div>
                                )}

                                {/* Row 4: Address */}
                                <div className="mb-4">
                                    <label htmlFor="address" style={styles.label}>Full Address</label>
                                    <textarea
                                        className={`form-control shadow-none ${fieldErrors.address ? 'is-invalid border-danger' : ''}`}
                                        style={styles.input}
                                        placeholder="Street, City, Postal Code"
                                        name="address"
                                        rows="2"
                                        value={address}
                                        onChange={onInputChange}
                                        onBlur={validateAddress}
                                    />
                                    {fieldErrors.address && <div style={styles.errorText}>{fieldErrors.address}</div>}
                                </div>

                                {/* Submit */}
                                <div className="d-grid mt-5">
                                    <button
                                        type="submit"
                                        className="btn btn-dark"
                                        style={styles.button}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#000'}
                                    >
                                        CREATE ACCOUNT
                                    </button>
                                </div>

                                <div className="text-center mt-4">
                                    <p className="small text-muted">
                                        Already have an account?
                                        <span
                                            className="ms-2 text-black fw-bold"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleTransition('/login')}
                                        >
                                            Login
                                        </span>
                                    </p>
                                </div>

                            </form>
                        </div>
                    )}

                    
                </div>

            </div>
            {/* --- WAVE LOADER OVERLAY (Only visible when clicking Login) --- */}
                    {isNavigating && (
                        <div style={styles.loaderOverlay}>
                            <div className="wave-loader">
                                <div className="wave-dot"></div>
                                <div className="wave-dot"></div>
                                <div className="wave-dot"></div>
                                <div className="wave-dot"></div>
                                <div className="wave-dot"></div>
                            </div>
                            <div className="mt-4 text-dark small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>
                                Redirecting to Portal
                            </div>
                        </div>
                    )}
        </div>
    );
}

export default Register;