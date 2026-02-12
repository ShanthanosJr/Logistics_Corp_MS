import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../../api/axiosConfig';

const UpdateProfile = () => {
    // --- STATE & LOGIC ---
    const { id } = useParams();
    const navigate = useNavigate();

    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN';

    // Role check - allow users to edit their own profile
    useEffect(() => {
        const loggedInUserId = localStorage.getItem('userId');
        if (!isAdmin && loggedInUserId !== id) {
            navigate('/');
        }
    }, [isAdmin, id, navigate]);

    const [formData, setFormData] = useState({
        userid: "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: "",
        type: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        userimg: "" // Add userimg field
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [existingUserImage, setExistingUserImage] = useState("");
    const [fileError, setFileError] = useState("");

    const [loading, setLoading] = useState(true);
    const [fieldErrors, setFieldErrors] = useState({});
    const [globalError, setGlobalError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false); // <--- NEW STATE FOR SUCCESS SCREEN

    // --- NEW: ANIMATION STATE ---
    const [isNavigating, setIsNavigating] = useState(false);

    // --- NEW: TRANSITION HANDLER ---
    const handleTransition = (path) => {
        setIsNavigating(true); // 1. Start the Wave Animation

        // 2. Wait 1 second, then navigate
        setTimeout(() => {
            navigate(path);
        }, 1000);
    };

    const { userid, firstname, lastname, email, phone, address, type, currentPassword, newPassword, confirmPassword } = formData;

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/user/${id}`);
                setFormData(prev => ({
                    ...prev,
                    userid: response.data.userid || "",
                    firstname: response.data.firstname || "",
                    lastname: response.data.lastname || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    address: response.data.address || "",
                    type: response.data.type || "",
                    userimg: response.data.userimg || "", // Set userimg
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }));
                // Set existing user image if available
                if (response.data.userimg) {
                    setExistingUserImage(response.data.userimg);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setGlobalError("Could not retrieve user profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id]);

    // --- INPUT HANDLER ---
    const onInputChange = (e) => {
        setFieldErrors(prev => ({ ...prev, [e.target.name]: "" }));
        setGlobalError("");
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Live validation
        switch (e.target.name) {
            case 'firstname':
                validateFirstname();
                break;
            case 'lastname':
                validateLastname();
                break;
            case 'phone':
                validatePhone();
                break;
            case 'currentPassword':
                validateCurrentPassword();
                break;
            case 'newPassword':
                validateNewPassword();
                break;
            case 'confirmPassword':
                validateConfirmPassword();
                break;
            default:
                break;
        }
    };

    // --- FILE HANDLER ---
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

    // --- VALIDATION LOGIC ---
    const validateFirstname = () => {
        if (!firstname.trim()) setFieldErrors(prev => ({ ...prev, firstname: "First name is required." }));
        else if (!/^[a-zA-Z\s]+$/.test(firstname)) setFieldErrors(prev => ({ ...prev, firstname: "Letters only." }));
        else setFieldErrors(prev => ({ ...prev, firstname: "" }));
    };

    const validateLastname = () => {
        if (!lastname.trim()) setFieldErrors(prev => ({ ...prev, lastname: "Last name is required." }));
        else if (!/^[a-zA-Z\s]+$/.test(lastname)) setFieldErrors(prev => ({ ...prev, lastname: "Letters only." }));
        else setFieldErrors(prev => ({ ...prev, lastname: "" }));
    };

    const validatePhone = () => {
        const phoneRegex = /^(\+94|0)[0-9]{9}$/;
        if (phone && !phoneRegex.test(phone)) setFieldErrors(prev => ({ ...prev, phone: "Format: 077... or +9477..." }));
        else setFieldErrors(prev => ({ ...prev, phone: "" }));
    };

    const validateCurrentPassword = () => {
        if (newPassword || confirmPassword) {
            if (!currentPassword) setFieldErrors(prev => ({ ...prev, currentPassword: "Required to authorize changes." }));
            else setFieldErrors(prev => ({ ...prev, currentPassword: "" }));
        } else {
            setFieldErrors(prev => ({ ...prev, currentPassword: "" }));
        }
    };

    const validateNewPassword = () => {
        if (newPassword && newPassword.length < 6) setFieldErrors(prev => ({ ...prev, newPassword: "Min 6 characters." }));
        else if (newPassword !== confirmPassword && confirmPassword) setFieldErrors(prev => ({ ...prev, newPassword: "Passwords do not match." }));
        else setFieldErrors(prev => ({ ...prev, newPassword: "" }));
    };

    const validateConfirmPassword = () => {
        if (newPassword !== confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match." }));
        else setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
    };

    const validateForm = () => {
        const errors = {};
        const nameRegex = /^[a-zA-Z\s]+$/;
        const phoneRegex = /^(\+94|0)[0-9]{9}$/;

        if (!firstname.trim()) errors.firstname = "First name is required.";
        else if (!nameRegex.test(firstname)) errors.firstname = "Letters only.";

        if (!lastname.trim()) errors.lastname = "Last name is required.";
        else if (!nameRegex.test(lastname)) errors.lastname = "Letters only.";

        if (phone && !phoneRegex.test(phone)) errors.phone = "Format: 077... or +9477...";

        if (newPassword || currentPassword || confirmPassword) {
            if (!currentPassword) errors.currentPassword = "Required to authorize changes.";
            if (newPassword && newPassword.length < 6) errors.newPassword = "Min 6 characters.";
            if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
        }

        return errors;
    };

    // --- SUBMIT HANDLER ---
    const onSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            // Upload image if selected
            let userImageName = existingUserImage; // Keep existing image by default

            if (selectedFile) {
                const formDataImage = new FormData();
                formDataImage.append("file", selectedFile);

                const imgUploadResponse = await api.post("/user/userImg", formDataImage, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (imgUploadResponse.data.startsWith("Error")) {
                    throw new Error(imgUploadResponse.data);
                }

                userImageName = imgUploadResponse.data;
            }

            // Update form data with user image
            const updatedFormData = {
                ...formData,
                userimg: userImageName
            };

            await api.put(`/user/${id}`, updatedFormData);

            // --- SUCCESS HANDLING ---
            setIsSuccess(true); // Trigger Success View

            // Wait 3 seconds then redirect
            setTimeout(() => {
                navigate("/user-profile");
            }, 3000);

        } catch (error) {
            console.error("Error updating profile:", error);
            setGlobalError(
                typeof error.response?.data === 'object'
                    ? error.response?.data?.message
                    : error.response?.data || "Update failed. Please try again."
            );
        }
    };

    // --- STYLES (Black & White Premium) ---
    const styles = {
        container: {
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
        },
        formSide: {
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4rem 5rem',
            height: '100vh',
            overflowY: 'auto',
            position: 'relative', // Needed for absolute overlay
        },
        successOverlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            animation: 'fadeIn 0.5s ease-in-out'
        },
        imageSide: {
            backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
            position: 'relative',
        },
        overlay: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            color: 'white',
            textAlign: 'center'
        },
        sectionTitle: {
            fontSize: '0.85rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#adb5bd',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '10px',
            marginBottom: '20px',
            marginTop: '10px'
        },
        label: {
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            color: '#6c757d',
            marginBottom: '5px'
        },
        input: {
            borderRadius: '0',
            border: '1px solid #dee2e6',
            padding: '10px 12px',
            backgroundColor: '#f8f9fa',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            resize: 'none',
            // overflow: 'hidden',
        },
        errorText: {
            fontSize: '0.7rem',
            color: '#dc3545',
            marginTop: '4px',
            fontWeight: '600'
        },
        button: {
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '0',
            padding: '15px',
            fontWeight: '600',
            letterSpacing: '1px',
            border: 'none',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            width: '100%'
        },
        cancelButton: {
            backgroundColor: 'transparent',
            color: '#6c757d',
            border: '1px solid #dee2e6',
            borderRadius: '0',
            padding: '15px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            width: '100%',
            transition: 'all 0.3s ease'
        }, // <--- Make sure there is a comma here

        // NEW: Loader Overlay Styles
        loaderOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // High opacity white
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <div className="spinner-border text-dark rounded-0" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-0" style={styles.container}>

            {/* --- NEW: GLOBAL ANIMATION STYLES --- */}
            <style>{`
                /* 1. Wave Animation (For Cancel Transition) */
                .wave-loader { display: flex; justify-content: center; align-items: center; }
                .wave-dot { 
                    width: 15px; height: 15px; margin: 0 5px; 
                    background-color: #000; border-radius: 50%; 
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

                /* 2. Success Animations (Keep your existing ones here) */
                @keyframes progress { from { width: 0%; } to { width: 100%; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            <div className="row g-0 h-100">

                {/* --- LEFT SIDE: Form or Success --- */}
                <div className="col-lg-7 col-md-12" style={styles.formSide}>

                    {/* CONDITIONAL RENDERING: Success View */}
                    {isSuccess ? (
                        <div style={styles.successOverlay}>
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
                                Profile Updated
                            </h2>
                            <p className="text-muted text-center" style={{ maxWidth: '400px' }}>
                                Your account settings and security preferences have been successfully saved. Redirecting...
                            </p>

                            {/* Simple Loading Bar */}
                            <div className="mt-4" style={{ width: '200px', height: '2px', backgroundColor: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'absolute', left: 0, top: 0, height: '100%', width: '100%',
                                    backgroundColor: '#000', animation: 'progress 3s linear'
                                }}></div>
                            </div>

                            {/* Inline Style for Animation */}
                            <style>
                                {`
                                    @keyframes progress { from { width: 0%; } to { width: 100%; } }
                                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                                `}
                            </style>
                        </div>
                    ) : (
                        // STANDARD FORM VIEW
                        <div className="mx-auto w-100" style={{ maxWidth: '650px', marginTop: '20rem' }}>

                            <div className="mb-5 d-flex justify-content-between align-items-end">
                                <div>
                                    <span className="badge bg-dark rounded-0 mb-2">SETTINGS</span>
                                    <h2 className="display-6 fw-bold text-black" style={{ letterSpacing: '-1px' }}>
                                        Edit Profile
                                    </h2>
                                    <span className="badge bg-dark rounded-0 mb-2">{type || 'User'}</span>

                                </div>
                                <div className="text-end text-muted small">
                                    Update your personal details <br /> & security preferences.
                                </div>
                            </div>

                            {/* Global Error Banner */}
                            {globalError && (
                                <div className="alert alert-dark rounded-0 border-0 mb-4 p-3 small">
                                    ⚠️ {globalError}
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
                                        ) : existingUserImage ? (
                                            <img
                                                src={`${API_BASE_URL}/user/uploads/${existingUserImage}`}
                                                alt="Current Profile"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ color: '#6c757d', fontSize: '0.8rem' }}>No Image</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <label htmlFor="userImage" className="btn btn-outline-dark btn-sm" style={{ borderRadius: '0', fontSize: '0.8rem' }}>
                                            {existingUserImage ? 'Change Photo' : 'Upload Photo'}
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

                                {/* SECTION: PERSONAL IDENTITY */}
                                <div style={styles.sectionTitle}>Identity Information</div>

                                <div className="row mb-3">
                                    <div className="col-md-12 mb-3 mb-md-0">
                                        <label htmlFor="userid" style={styles.label}>User ID</label>
                                        <input
                                            type="text"
                                            className="form-control shadow-none"
                                            style={{ ...styles.input, backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                            name="userid"
                                            value={userid || ''}
                                            onChange={onInputChange}
                                            readOnly
                                        />
                                        <div className="form-text small mt-1 text-success opacity-75">Unique identifier (cannot be changed)</div>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label htmlFor="firstname" style={styles.label}>First Name</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-none ${fieldErrors.firstname ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            name="firstname"
                                            value={firstname || ''}
                                            onChange={onInputChange}
                                            placeholder="John"
                                        />
                                        {fieldErrors.firstname && <div style={styles.errorText}>{fieldErrors.firstname}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="lastname" style={styles.label}>Last Name</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-none ${fieldErrors.lastname ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            name="lastname"
                                            value={lastname || ''}
                                            onChange={onInputChange}
                                            placeholder="Doe"
                                        />
                                        {fieldErrors.lastname && <div style={styles.errorText}>{fieldErrors.lastname}</div>}
                                    </div>
                                </div>

                                {/* SECTION: CONTACT DETAILS */}
                                <div style={styles.sectionTitle}>Contact Details</div>

                                <div className="row mb-3">
                                    <div className="col-md-7 mb-3 mb-md-0">
                                        <label htmlFor="email" style={styles.label}>Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control shadow-none"
                                            style={{ ...styles.input, backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                            name="email"
                                            value={email || ''}
                                            onChange={onInputChange}
                                            readOnly
                                        />
                                        <div className="form-text small mt-1 text-success opacity-75">Email cannot be changed directly.</div>
                                    </div>
                                    <div className="col-md-5">
                                        <label htmlFor="phone" style={styles.label}>Phone Number</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-none ${fieldErrors.phone ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            name="phone"
                                            value={phone || ''}
                                            onChange={onInputChange}
                                            placeholder="+94... or 07..."
                                        />
                                        {fieldErrors.phone && <div style={styles.errorText}>{fieldErrors.phone}</div>}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="address" style={styles.label}>Residential Address</label>
                                    <textarea
                                        className="form-control shadow-none"
                                        style={styles.input}
                                        name="address"
                                        rows="2"
                                        value={address || ''}
                                        onChange={onInputChange}
                                        placeholder="123 Main St, Colombo"
                                    />
                                </div>

                                {/* SECTION: SECURITY */}
                                <div style={styles.sectionTitle} className="mt-5">Security Configuration</div>
                                <div className="p-4 bg-light border mb-4">
                                    <div className="mb-3">
                                        <label htmlFor="currentPassword" style={styles.label}>Current Password (If required to change)</label>
                                        <input
                                            type="password"
                                            className={`form-control shadow-none ${fieldErrors.currentPassword ? 'is-invalid border-danger' : ''}`}
                                            style={{ ...styles.input, backgroundColor: '#fff' }}
                                            name="currentPassword"
                                            value={currentPassword}
                                            onChange={onInputChange}
                                            placeholder="••••••••"
                                        />
                                        {fieldErrors.currentPassword && <div style={styles.errorText}>{fieldErrors.currentPassword}</div>}
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <label htmlFor="newPassword" style={styles.label}>New Password</label>
                                            <input
                                                type="password"
                                                className={`form-control shadow-none ${fieldErrors.newPassword ? 'is-invalid border-danger' : ''}`}
                                                style={{ ...styles.input, backgroundColor: '#fff' }}
                                                name="newPassword"
                                                value={newPassword}
                                                onChange={onInputChange}
                                                placeholder="New secret"
                                            />
                                            {fieldErrors.newPassword && <div style={styles.errorText}>{fieldErrors.newPassword}</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
                                            <input
                                                type="password"
                                                className={`form-control shadow-none ${fieldErrors.confirmPassword ? 'is-invalid border-danger' : ''}`}
                                                style={{ ...styles.input, backgroundColor: '#fff' }}
                                                name="confirmPassword"
                                                value={confirmPassword}
                                                onChange={onInputChange}
                                                placeholder="Repeat secret"
                                            />
                                            {fieldErrors.confirmPassword && <div style={styles.errorText}>{fieldErrors.confirmPassword}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <button
                                            type="submit"
                                            style={styles.button}
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#000'}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                    <div className="col-md-4">
                                        <button
                                            type="button"
                                            style={styles.cancelButton}
                                            onClick={() => handleTransition("/user-profile")} // <--- UPDATED
                                            onMouseOver={(e) => { e.target.style.borderColor = '#000'; e.target.style.color = '#000' }}
                                            onMouseOut={(e) => { e.target.style.borderColor = '#dee2e6'; e.target.style.color = '#6c757d' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </div>
                    )}
                </div>

                {/* --- RIGHT SIDE: Image --- */}
                <div className="col-lg-5 d-none d-lg-block" style={{ height: '100vh' }}>
                    <div style={styles.imageSide} className="h-100 w-100">
                        <div style={styles.overlay}>
                            <h1 className="display-4 fw-bold mb-4" style={{ letterSpacing: '-2px' }}>
                                Personalize
                            </h1>
                            <div style={{ width: '50px', height: '2px', background: 'white', marginBottom: '2rem' }}></div>
                            <p className="fs-5 fw-light fst-italic">
                                "Design is not just what it looks like and feels like. Design is how it works."
                            </p>
                            <p className="small text-white-50 mt-2">- Steve Jobs</p>
                        </div>
                    </div>
                </div>

                {/* --- NEW: WAVE LOADER OVERLAY --- */}
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
                            Discarding Changes
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default UpdateProfile;