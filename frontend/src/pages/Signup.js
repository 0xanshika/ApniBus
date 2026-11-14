import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { register } from '../api';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();
    const location = useLocation(); // Initialize location hook here

    // ... inside your handleSubmit in Signup.js:
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Grab the role from the selection page (default to 'user' if missing)
        const userRole = location.state?.role || 'user'; 
        
        const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, role: userRole })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name || '');
            localStorage.setItem('userEmail', data.user.email || '');

            // REDIRECT LOGIC
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/'); // Users start at Home
            }
            window.location.reload();
        }
    } catch (err) {
        alert("Signup failed");
    }
};

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoCircle}>🚍</div>
                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>Join the ApniBus community</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        style={styles.input} 
                        required
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        style={styles.input} 
                        required
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                    <input 
                        type="password" 
                        placeholder="Create Password" 
                        style={styles.input} 
                        required
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <button type="submit" style={styles.button}>SIGN UP</button>
                </form>
                
                <p style={{marginTop: '15px', fontSize: '14px'}}>
                    Already have an account? 
                    <span onClick={() => navigate('/login')} style={styles.link}> Log In</span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#2563eb' // ApniBus Blue
    },
    card: { 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '20px', 
        width: '340px', 
        textAlign: 'center', 
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)' 
    },
    logoCircle: { 
        width: '50px', 
        height: '50px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 10px', 
        fontSize: '24px' 
    },
    title: { margin: 0, color: '#1e293b', fontSize: '24px' },
    subtitle: { color: '#64748b', marginBottom: '20px', fontSize: '14px' },
    input: { 
        width: '100%', 
        padding: '12px', 
        marginBottom: '12px', 
        borderRadius: '8px', 
        border: '1px solid #cbd5e1', 
        boxSizing: 'border-box',
        outline: 'none'
    },
    button: { 
        width: '100%', 
        padding: '12px', 
        backgroundColor: '#2563eb', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontWeight: 'bold', 
        cursor: 'pointer',
        fontSize: '16px'
    },
    link: { 
        color: '#2563eb', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        marginLeft: '5px'
    }
};

export default Signup;