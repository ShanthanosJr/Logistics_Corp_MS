import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    // --- TRANSITION ANIMATION STATE ---
    const [isNavigating, setIsNavigating] = useState(false);

    const handleTransition = (path) => {
        setIsNavigating(true); // 1. Show the overlay
        
        // 2. Wait 1s for animation, then move
        setTimeout(() => {
            navigate(path);
        }, 1000); 
    };

    // --- STYLES (Premium Monochrome Theme) ---
    const styles = {
        wrapper: {
            fontFamily: "'Inter', sans-serif",
            color: '#000',
            overflowX: 'hidden'
        },
        // Hero Section
        heroSection: {
            position: 'relative',
            height: '85vh',
            backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)', // Enforce B&W Theme
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        heroOverlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)', // Darken for text readability
            zIndex: 1
        },
        heroContent: {
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: '#fff',
            maxWidth: '800px',
            padding: '20px'
        },
        heroTitle: {
            fontSize: '4rem',
            fontWeight: '800',
            letterSpacing: '-2px',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            lineHeight: '1.1'
        },
        heroSubtitle: {
            fontSize: '1.25rem',
            fontWeight: '300',
            color: '#e0e0e0',
            marginBottom: '2.5rem',
            letterSpacing: '1px'
        },
        ctaButton: {
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            padding: '15px 40px',
            fontSize: '1rem',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            textDecoration: 'none',
            display: 'inline-block'
        },
        // Action Grid Section
        gridSection: {
            padding: '5rem 2rem',
            backgroundColor: '#fff',
            borderBottom: '1px solid #f0f0f0'
        },
        sectionLabel: {
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#888',
            marginBottom: '3rem'
        },
        cardGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        actionCard: {
            border: '1px solid #e5e5e5',
            padding: '2.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            backgroundColor: '#fff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        cardIcon: {
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: '#000'
        },
        cardTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            letterSpacing: '-0.5px'
        },
        cardDesc: {
            color: '#666',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '2rem'
        },
        arrowLink: {
            fontSize: '0.9rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        // Footer
        footer: {
            backgroundColor: '#000',
            color: '#fff',
            padding: '3rem 2rem',
            textAlign: 'center',
        },
        footerText: {
            fontSize: '0.8rem',
            color: '#666',
            letterSpacing: '1px',
            textTransform: 'uppercase'
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
        <div style={styles.wrapper}>
            
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
            
            {/* --- HERO SECTION --- */}
            <div style={styles.heroSection}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.heroContent}>
                    <div className="mb-3">
                        <span className="badge bg-white text-black rounded-0 px-3 py-2 fw-bold" style={{letterSpacing: '1px'}}>SYSTEM V2.0</span>
                    </div>
                    <h1 style={styles.heroTitle}>
                        Precision <br/> Logistical Control
                    </h1>
                    <p style={styles.heroSubtitle}>
                        The advanced operating system for modern warehouse inventory management. Secure. Scalable. Fast.
                    </p>
                    <button 
                        style={styles.ctaButton}
                        onClick={() => handleTransition('/login')}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        Access System
                    </button>
                </div>
            </div>

            {/* --- QUICK ACCESS GRID --- */}
            <div style={styles.gridSection}>
                <p style={styles.sectionLabel}>— System Modules —</p>
                
                <div style={styles.cardGrid}>
                    
                    {/* Card 1: Inventory */}
                    <div 
                        style={styles.actionCard}
                        onClick={() => handleTransition('/display-item')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#000';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e5e5e5';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div>
                            <div style={styles.cardIcon}>📦</div>
                            <h3 style={styles.cardTitle}>Inventory Dashboard</h3>
                            <p style={styles.cardDesc}>
                                Visualize stock levels, manage assets, and generate real-time PDF reports.
                            </p>
                        </div>
                        <div style={styles.arrowLink}>View Inventory <span>→</span></div>
                    </div>

                    {/* Card 2: New Item */}
                    <div 
                        style={styles.actionCard}
                        onClick={() => handleTransition('/display-users')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#000';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e5e5e5';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div>
                            <div style={styles.cardIcon}>➕</div>
                            <h3 style={styles.cardTitle}>User Dashboard</h3>
                            <p style={styles.cardDesc}>
                                Check user accounts in the database with detailed specifications and images.
                            </p>
                        </div>
                        <div style={styles.arrowLink}>View Here <span>→</span></div>
                    </div>

                    {/* Card 3: Profile/Admin */}
                    <div 
                        style={styles.actionCard}
                        onClick={() => handleTransition('/user-profile')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#000';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e5e5e5';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div>
                            <div style={styles.cardIcon}>👤</div>
                            <h3 style={styles.cardTitle}>User Profile</h3>
                            <p style={styles.cardDesc}>
                                Manage your account settings, view roles, and update personal information.
                            </p>
                        </div>
                        <div style={styles.arrowLink}>View Profile <span>→</span></div>
                    </div>

                </div>
            </div>

            {/* --- FOOTER --- */}
            <footer style={styles.footer}>
                <h4 className="fw-bold text-white mb-3" style={{letterSpacing: '1px'}}>INVENTORY MANAGEMENT SYSTEM</h4>
                <p style={styles.footerText}>
                    © 2025 LOGISTICS CORP. ALL RIGHTS RESERVED. <br/>
                    DESIGNED FOR MODERN WAREHOUSES.
                </p>
            </footer>

            {/* --- ANIMATION OVERLAY (Visible when navigating) --- */}
            {isNavigating && (
                <div style={styles.loaderOverlay}>
                    <div className="wave-loader">
                        <div className="wave-dot"></div>
                        <div className="wave-dot"></div>
                        <div className="wave-dot"></div>
                        <div className="wave-dot"></div>
                        <div className="wave-dot"></div>
                    </div>
                    <div className="mt-4 text-dark small fw-bold text-uppercase" style={{letterSpacing: '2px'}}>Accessing Module</div>
                </div>
            )}

        </div>
    );
};

export default Home;