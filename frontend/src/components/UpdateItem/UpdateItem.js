import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";

const UpdateItem = () => {
    // --- STATE & LOGIC ---
    const { id } = useParams();
    const navigate = useNavigate();

    // Role check
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const [formdata, setFormData] = useState({
        itemId: "",
        itemName: "",
        itemCategory: "",
        itemQty: "",
        itemDetails: ""
    });

    const IMAGE_BASE_URL = "http://localhost:8081/user/uploads";
    const [selectedFile, setSelectedFile] = useState(null);
    const [existingItemImage, setExistingItemImage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

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

    const categories = [
        "Electronics", "Furniture", "Office Supplies", "Tools & Hardware",
        "Clothing & Apparel", "Books & Media", "Sports & Outdoors",
        "Home & Garden", "Health & Beauty", "Toys & Games",
        "Automotive", "Industrial Equipment", "Food & Beverage",
        "Jewelry & Accessories", "Pet Supplies"
    ];

    const { itemId, itemName, itemCategory, itemQty, itemDetails } = formdata;

    // --- VALIDATION LOGIC ---
    /*const validateItemId = () => {
        const idRegex = /^[a-zA-Z0-9-]+$/;
        if (!itemId.trim()) setFieldErrors(prev => ({ ...prev, itemId: "Item ID is required." }));
        else if (!idRegex.test(itemId)) setFieldErrors(prev => ({ ...prev, itemId: "Alphanumeric and hyphens only." }));
        else setFieldErrors(prev => ({ ...prev, itemId: "" }));
    };*/

    const validateItemName = () => {
        const nameRegex = /^[a-zA-Z0-9\s]+$/
        if (!itemName.trim()) setFieldErrors(prev => ({ ...prev, itemName: "Name is required." }));
        else if (!nameRegex.test(itemName)) setFieldErrors(prev => ({ ...prev, itemName: "Letters/numbers only." }));
        else setFieldErrors(prev => ({ ...prev, itemName: "" }));
    };

    const validateItemQty = () => {
        if (!itemQty) setFieldErrors(prev => ({ ...prev, itemQty: "Qty required." }));
        else if (isNaN(itemQty) || parseInt(itemQty) < 0) setFieldErrors(prev => ({ ...prev, itemQty: "Positive number only." }));
        else setFieldErrors(prev => ({ ...prev, itemQty: "" }));
    };

    const validateItemCategory = () => {
        if (itemCategory && !categories.includes(itemCategory)) {
            if (!/^[a-zA-Z\s]+$/.test(itemCategory)) setFieldErrors(prev => ({ ...prev, itemCategory: "Letters/spaces only." }));
            else setFieldErrors(prev => ({ ...prev, itemCategory: "" }));
        }
        else setFieldErrors(prev => ({ ...prev, itemCategory: "" }));
    };

    const validateItemDetails = () => {
        setFieldErrors(prev => ({ ...prev, itemDetails: "" }));
    };

    const validateFile = () => {
        if (selectedFile) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(selectedFile.type)) setFieldErrors(prev => ({ ...prev, file: "JPG, PNG, GIF only." }));
            else if (selectedFile.size > 5 * 1024 * 1024) setFieldErrors(prev => ({ ...prev, file: "Max size 5MB." }));
            else setFieldErrors(prev => ({ ...prev, file: "" }));
        } else {
            setFieldErrors(prev => ({ ...prev, file: "" }));
        }
    };

    // --- API CALLS ---
    const fetchItemData = useCallback(async () => {
        try {
            const response = await api.get(`/inventory/${id}`);
            const ItemData = response.data;
            setFormData({
                itemId: ItemData.itemId || '',
                itemName: ItemData.itemName || '',
                itemCategory: ItemData.itemCategory || '',
                itemQty: ItemData.itemQty || '',
                itemDetails: ItemData.itemDetails || ''
            });
            setExistingItemImage(ItemData.itemImage || "");
        } catch (error) {
            console.error("Error fetching item data:", error);
            alert("Could not fetch item data.");
        }
    }, [id]);

    useEffect(() => {
        fetchItemData();
    }, [fetchItemData]);

    const onInputChange = (e) => {
        setFieldErrors(prev => ({ ...prev, [e.target.name]: "" }));
        setFormData({ ...formdata, [e.target.name]: e.target.value });
    };

    const onFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        validateFile();
    };

    // --- SUBMISSION HANDLER (FIXED) ---
    const onSubmit = async (e) => {
        e.preventDefault();

        // validateItemId();
        validateItemName();
        validateItemQty();
        validateItemCategory();
        validateItemDetails();
        validateFile();

        const hasErrors = Object.values(fieldErrors).some(error => error !== '');
        if (hasErrors) {
            alert("Please fix the errors above before submitting.");
            return;
        }

        try {
            // 1. Construct FormData (Required by Backend)
            const data = new FormData();

            // 1. Get the active user
            const activeUser = localStorage.getItem('userFirstName') || localStorage.getItem('username') || localStorage.getItem('userEmail') || "Admin";
            // 2. Prepare the object payload
            const payloadObject = {
                id: id,
                itemId: formdata.itemId, // Crucial: Must be included
                itemName: formdata.itemName,
                itemCategory: formdata.itemCategory,
                itemQty: parseInt(formdata.itemQty),
                itemDetails: formdata.itemDetails,
                itemImage: existingItemImage, // Keep old image name if no new file
                performedBy: activeUser // <--- ADD THIS NEW FIELD
            };

            // 3. Append JSON data as a string
            data.append('itemDetails', JSON.stringify(payloadObject));

            // 4. Append File ONLY if selected (Backend handles the optionality)
            if (selectedFile) {
                data.append("file", selectedFile);
            }

            // 5. Send as Multipart
            await api.put(`/inventory/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // --- SUCCESS HANDLING ---
            setIsSuccess(true);

            setTimeout(() => {
                navigate("/display-item");
            }, 3000);

        } catch (error) {
            console.error("Error updating item:", error);
            const msg = error.response?.data?.message || "Check console for details.";
            alert(`Update Failed: ${msg}`);
        }
    };

    // --- STYLES (Black & White Premium) ---
    const styles = {
        container: {
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden'
        },
        formSide: {
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2rem 4rem',
            height: '100vh',
            overflowY: 'auto',
            position: 'relative'
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
            backgroundImage: "url('https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
            position: 'relative',
        },
        overlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            color: 'white',
            textAlign: 'center'
        },
        input: {
            borderRadius: '0',
            border: '1px solid #ccc',
            padding: '10px 12px',
            backgroundColor: '#f8f9fa',
            fontSize: '0.95rem',
            resize: 'none',
            //overflow: 'hidden'
        },
        readOnlyInput: {
            backgroundColor: '#e9ecef',
            color: '#6c757d',
            cursor: 'not-allowed',
            border: '1px solid #dee2e6'
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
        cancelButton: {
            backgroundColor: 'transparent',
            color: '#000',
            border: '1px solid #000',
            borderRadius: '0',
            padding: '14px',
            fontWeight: '600',
            letterSpacing: '1px',
            width: '100%',
            transition: 'all 0.3s ease'
        },
        // NEW: Loader Overlay Styles
        loaderOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
        }
    };

    return (
        <div className="container-fluid p-0" style={styles.container}>
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
                /* 2. Success Animations (Keep existing ones here) */
                @keyframes progress { from { width: 0%; } to { width: 100%; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                }
            `}</style>
            <div className="row g-0 h-100">

                {/* --- LEFT SIDE: Form or Success (Flipped) --- */}
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
                                Changes Saved
                            </h2>
                            <p className="text-muted text-center" style={{ maxWidth: '400px' }}>
                                The asset record has been successfully updated. Redirecting to inventory...
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
                        <div className="mx-auto w-100" style={{ maxWidth: '650px' }}>

                            <div className="mb-4 d-flex justify-content-between align-items-end">
                                <div>
                                    <span className="badge bg-dark rounded-0 mb-2">EDIT MODE</span>
                                    <h2 className="display-6 fw-bold text-black" style={{ letterSpacing: '-1px' }}>
                                        Update Item
                                    </h2>
                                </div>
                                <div className="text-end">
                                    <p className="text-muted small mb-0">Item Ref</p>
                                    <span className="text-dark fw-bold small">#{id || '...'}</span>
                                </div>
                            </div>

                            <form onSubmit={onSubmit}>
                                {/* Row 1: ID & Name */}
                                <div className="row mb-3">
                                    <div className="col-md-4 mb-3 mb-md-0">
                                        <label htmlFor="itemId" style={styles.label}>System ID</label>
                                        <input
                                            type="text"
                                            className="form-control shadow-none"
                                            style={{ ...styles.input, ...styles.readOnlyInput }}
                                            name="itemId"
                                            value={itemId}
                                            readOnly
                                        />
                                        {fieldErrors.itemId && <div style={styles.errorText}>{fieldErrors.itemId}</div>}
                                        <div className="form-text small mt-1 text-success opacity-75">System-generated ID</div>
                                    </div>
                                    <div className="col-md-8">
                                        <label htmlFor="itemName" style={styles.label}>Item Name</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-none ${fieldErrors.itemName ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            placeholder="Item Name"
                                            name="itemName"
                                            value={itemName}
                                            onChange={onInputChange}
                                            onBlur={validateItemName}
                                        />
                                        {fieldErrors.itemName && <div style={styles.errorText}>{fieldErrors.itemName}</div>}
                                    </div>
                                </div>

                                {/* Row 2: Category & Quantity */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label htmlFor="itemCategory" style={styles.label}>Category</label>
                                        <select
                                            className="form-control shadow-none"
                                            style={{ ...styles.input, ...styles.readOnlyInput }}
                                            name="itemCategory"
                                            value={itemCategory}
                                            disabled
                                        >
                                            <option value="">{itemCategory || "Select a Category"}</option>
                                        </select>
                                        <div className="form-text small mt-1 text-success opacity-75">Category is set during creation</div>
                                        {fieldErrors.itemCategory && <div style={styles.errorText}>{fieldErrors.itemCategory}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="itemQty" style={styles.label}>Stock Quantity</label>
                                        <input
                                            type="number"
                                            className={`form-control shadow-none ${fieldErrors.itemQty ? 'is-invalid border-danger' : ''}`}
                                            style={styles.input}
                                            placeholder="0"
                                            name="itemQty"
                                            value={itemQty}
                                            onChange={onInputChange}
                                            onBlur={validateItemQty}
                                        />
                                        {fieldErrors.itemQty && <div style={styles.errorText}>{fieldErrors.itemQty}</div>}
                                    </div>
                                </div>

                                {/* Row 3: Details */}
                                <div className="mb-4">
                                    <label htmlFor="itemDetails" style={styles.label}>Specifications / Details</label>
                                    <textarea
                                        className="form-control shadow-none"
                                        style={styles.input}
                                        placeholder="Enter detailed technical specifications..."
                                        name="itemDetails"
                                        rows="4"
                                        value={itemDetails}
                                        onChange={onInputChange}
                                        onBlur={validateItemDetails}
                                    />
                                    {fieldErrors.itemDetails && <div style={styles.errorText}>{fieldErrors.itemDetails}</div>}
                                </div>

                                {/* Row 4: Image Upload */}
                                <div className="mb-5">
                                    <label htmlFor="itemImageFile" style={styles.label}>Update Image</label>
                                    <input
                                        type="file"
                                        className={`form-control shadow-none ${fieldErrors.file ? 'is-invalid border-danger' : ''}`}
                                        style={{ ...styles.input, padding: '8px' }}
                                        name="itemImageFile"
                                        onChange={onFileChange}
                                    />
                                    {fieldErrors.file && <div style={styles.errorText}>{fieldErrors.file}</div>}

                                    {existingItemImage && (
                                        <div className="mt-3">
                                            <div className="small text-muted mb-2">Current Image:</div>
                                            <div className="border p-2 bg-light">
                                                <img
                                                    src={`${IMAGE_BASE_URL}/${existingItemImage}`}
                                                    alt="Current item"
                                                    style={{ maxWidth: '200px', maxHeight: '200px', display: 'block', margin: '0 auto' }}
                                                />
                                                <div className="text-center mt-2 small text-muted">
                                                    {existingItemImage}
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                            SAVE CHANGES
                                        </button>
                                    </div>
                                    <div className="col-md-4">
                                        <button
                                            type="button"
                                            style={styles.cancelButton}
                                            onClick={() => handleTransition("/display-item")}
                                            onMouseOver={(e) => { e.target.style.backgroundColor = '#000'; e.target.style.color = '#fff' }}
                                            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#000' }}
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </div>
                    )}
                </div>

                {/* --- RIGHT SIDE: Image (Flipped) --- */}
                <div className="col-lg-5 d-none d-lg-block" style={{ height: '100vh' }}>
                    <div style={styles.imageSide} className="h-100 w-100">
                        <div style={styles.overlay}>
                            <h1 className="display-4 fw-bold mb-4" style={{ letterSpacing: '-2px' }}>
                                Maintenance & Update
                            </h1>
                            <div style={{ width: '50px', height: '2px', background: 'white', marginBottom: '2rem' }}></div>
                            <p className="fs-5 fw-light fst-italic">
                                "Quality means doing it right when no one is looking."
                            </p>
                            <p className="small text-white-50 mt-2">- Henry Ford</p>
                        </div>
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
                        Cancelling Operation
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateItem;