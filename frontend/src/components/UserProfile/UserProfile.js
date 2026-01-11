import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    // --- STATE & LOGIC (Preserved) ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    // Role check
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN';
    const loggedInUserId = localStorage.getItem('userId');
    const isOwner = loggedInUserId === String(user?.id);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError("User not authenticated. Please log in.");
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await api.get(`/user/${userId}`);

                if (response.status !== 200) throw new Error('Failed to fetch user profile');
                setUser(response.data);

            } catch (err) {
                console.error("Profile fetch error:", err.response?.data || err.message);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("/// PERMANENT ACTION ///\nAre you sure you want to delete your profile? This cannot be undone.");
        if (!confirmDelete) return;

        try {
            await api.delete(`/user/${user.id}`);
            alert("Profile deleted successfully.");
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            navigate('/login');
        } catch (err) {
            console.error("Error deleting profile:", err.response?.data || err.message);
            alert(`Failed to delete profile: ${typeof err.response?.data === 'object' ? JSON.stringify(err.response?.data) : err.response?.data || err.message}`);
        }
    };

    // --- STYLES (Black & White Premium) ---
    const styles = {
        container: {
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
            backgroundColor: '#f8f9fa'
        },
        sidebar: {
            backgroundColor: '#000',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            position: 'relative',
            height: '100vh'
        },
        contentSide: {
            backgroundColor: '#fff',
            height: '100vh',
            overflowY: 'auto',
            padding: '4rem 5rem',
            display: 'flex',
            flexDirection: 'column'
        },
        avatarCircle: {
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            backgroundColor: '#333',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '3rem',
            fontWeight: 'bold',
            border: '4px solid #fff',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        },
        sidebarTitle: {
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '0.85rem',
            opacity: 0.7,
            marginBottom: '0.5rem'
        },
        sidebarName: {
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center',
            lineHeight: '1.1'
        },
        dataGroup: {
            marginBottom: '2rem',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '1rem'
        },
        label: {
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '1px',
            color: '#adb5bd',
            marginBottom: '0.25rem',
            display: 'block'
        },
        value: {
            fontSize: '1.25rem',
            fontWeight: '500',
            color: '#212529'
        },
        badge: {
            backgroundColor: '#000',
            color: '#fff',
            padding: '5px 10px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            borderRadius: '0',
            letterSpacing: '1px'
        },
        actionButton: {
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '0',
            padding: '15px 30px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            width: '100%',
            height: '100%', // Ensures equal height
            transition: 'all 0.3s ease',
            display: 'flex',            // Centering text
            alignItems: 'center',       // Centering text
            justifyContent: 'center'    // Centering text
        },
        deleteButton: {
            backgroundColor: 'transparent',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '0',
            padding: '15px 30px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            width: '100%',
            height: '100%', // Ensures equal height
            // marginTop: '1rem',  <-- REMOVED THIS LINE
            transition: 'all 0.3s ease',
            display: 'flex',            // Centering text
            alignItems: 'center',       // Centering text
            justifyContent: 'center'    // Centering text
        },
        backButton: {
            background: 'none',
            border: 'none',
            color: '#6c757d',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            marginBottom: '2rem',
            marginTop: '2rem',
            padding: 0,
            cursor: 'pointer'
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

    // --- RENDER STATES ---

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <div className="spinner-grow text-dark" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <div className="text-center">
                    <h3 className="text-muted mb-3">⚠️ Access Error</h3>
                    <p>{error}</p>
                    <button className="btn btn-dark rounded-0 mt-3" onClick={() => navigate('/login')}>Return to Login</button>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="text-center mt-5">User profile not found.</div>;
    }

    return (
        <div className="container-fluid p-0" style={styles.container}>

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
            <div className="row g-0">

                {/* --- LEFT SIDE: Identity --- */}
                <div className="col-lg-4 d-none d-lg-flex" style={styles.sidebar}>
                    {/* Abstract Background Elements */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 50% 50%, #212529 0%, #000 100%)',
                        zIndex: -1
                    }}></div>

                    <div style={styles.avatarCircle}>
                        {user.userimg ? (
                            <img
                                src={`http://localhost:8081/user/uploads/${user.userimg}`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span>{user.firstname ? user.firstname.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                    </div>

                    <span style={styles.sidebarTitle}>{user.type || 'Not-Defined'}</span>
                    <h1 style={styles.sidebarName}>{user.firstname} <br /> {user.lastname}</h1>

                    <div className="mt-4">
                        <span style={styles.badge}>ACTIVE USER</span>
                    </div>
                </div>

                {/* --- RIGHT SIDE: Technical Details --- */}
                <div className="col-lg-8" style={styles.contentSide}>
                    <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>

                        {/* Navigation Header */}
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <button style={styles.backButton} onClick={() => handleTransition('/')}>← Back</button>
                            <span className="text-muted small fw-bold">No: #{user.id}</span>
                        </div>

                        <span className="badge bg-dark mb-2 rounded-0">PERSONNEL</span>
                        <h2 className="display-6 fw-bold mb-5" style={{ letterSpacing: '-1px' }}>Profile Specifications</h2>

                        {/* Detail Rows */}
                        <div className="row">
                            <div style={styles.dataGroup}>
                                <span style={styles.label}>User ID</span>
                                <span style={styles.value}>{user.userid}</span>
                            </div>
                            <div className="col-md-6">
                                <div style={styles.dataGroup}>
                                    <span style={styles.label}>First Name</span>
                                    <span style={styles.value}>{user.firstname}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div style={styles.dataGroup}>
                                    <span style={styles.label}>Last Name</span>
                                    <span style={styles.value}>{user.lastname}</span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.dataGroup}>
                            <span style={styles.label}>Email Address</span>
                            <span style={styles.value}>{user.email}</span>
                        </div>

                        <div style={styles.dataGroup}>
                            <span style={styles.label}>Contact Phone</span>
                            <span style={styles.value}>{user.phone || 'Not Registered'}</span>
                        </div>

                        <div style={styles.dataGroup}>
                            <span style={styles.label}>Billing / Physical Address</span>
                            <span style={styles.value}>{user.address || 'Not Registered'}</span>
                        </div>

                        {/* Action Area */}
                        <div className="mt-5 pt-3">
                            <div className="row g-3 align-items-stretch"> {/* Added align-items-stretch */}
                                <div className="col-md-8">
                                    {(isAdmin || isOwner) && (
                                        <button
                                            style={styles.actionButton}
                                            onClick={() => handleTransition(`/update-profile/${user.id}`)}
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#000'}
                                        >
                                            Edit Configuration
                                        </button>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    {(isAdmin || isOwner) && (
                                        <button
                                            style={styles.deleteButton}
                                            onClick={handleDelete}
                                            onMouseOver={(e) => { e.target.style.backgroundColor = '#dc3545'; e.target.style.color = '#fff' }}
                                            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#dc3545' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

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
                    <div className="mt-4 text-dark small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>Processing Request</div>
                </div>
            )}
        </div>

    );
};

export default UserProfile;