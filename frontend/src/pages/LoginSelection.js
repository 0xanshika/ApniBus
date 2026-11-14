import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isSignup = location.pathname.includes('signup');

    const handleChoice = (role) => {
        const path = isSignup ? '/signup-form' : '/login-form';
        navigate(path, { state: { role: role } });
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{color: '#1e293b'}}>{isSignup ? "Create Account" : "Welcome Back"}</h2>
                <p style={{color: '#64748b', marginBottom: '30px'}}>Please select your role to continue</p>
                
                <div style={styles.buttonGroup}>
                    <button onClick={() => handleChoice('user')} style={styles.roleBtn}>
                        <span style={{fontSize: '30px'}}>👤</span><br/>User {isSignup ? "Signup" : "Login"}
                    </button>
                    <button onClick={() => handleChoice('admin')} style={styles.roleBtnAdmin}>
                        <span style={{fontSize: '30px'}}>🛡️</span><br/>Admin {isSignup ? "Signup" : "Login"}
                    </button>
                </div>
                <button onClick={() => navigate('/')} style={styles.backBtn}>Back to Home</button>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2563eb' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '25px', textAlign: 'center', width: '400px' },
    buttonGroup: { display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' },
    roleBtn: { flex: 1, padding: '20px', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', color: '#2563eb' },
    roleBtnAdmin: { flex: 1, padding: '20px', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', color: '#1e293b' },
    backBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }
};

export default LoginSelection;