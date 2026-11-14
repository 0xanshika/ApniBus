import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png'; // Make sure the path matches where you moved the file

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/';
    };

    return (
        <nav style={styles.nav}>
            {/* Logo Image replaced Emoji here */}
            <div style={styles.logoContainer} onClick={() => navigate('/')}>
                <img src={logoImg} alt="ApniBus Logo" style={styles.logoImage} />
                <span>ApniBus</span>
            </div>
            
            <div style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>
                {token && (
                    <>
                        <Link to="/dashboard" style={styles.link}>Track</Link>
                        <Link to="/booking" style={styles.link}>Booking</Link>
                        {role === 'admin' && <Link to="/admin" style={styles.linkAdmin}>Admin Panel</Link>}
                    </>
                )}

                {!token ? (
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => navigate('/login')} style={styles.loginBtn}>Login</button>
                        <button onClick={() => navigate('/signup')} style={styles.signupBtn}>Sign Up</button>
                    </div>
                ) : (
                    <div style={styles.userSection}>
                        <span style={styles.userLabel}>{role === 'admin' ? '🛡️ Admin' : '👤 User'}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 50px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 },
    logoContainer: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', color: '#2563eb' },
    logoImage: { height: '40px', width: 'auto', objectFit: 'contain' }, // Adjust height as needed
    links: { display: 'flex', alignItems: 'center', gap: '25px' },
    link: { textDecoration: 'none', color: '#475569', fontWeight: '500', fontSize: '15px' },
    linkAdmin: { textDecoration: 'none', color: '#dc2626', fontWeight: 'bold', fontSize: '15px' },
    loginBtn: { padding: '8px 20px', backgroundColor: 'transparent', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    signupBtn: { padding: '8px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    logoutBtn: { padding: '6px 15px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
    userLabel: { fontSize: '14px', color: '#64748b', fontWeight: '500' }
};

export default Navbar;