import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import it

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate(); // 2. Initialize it here!

    // Inside your handleSubmit in Login.js:
// ... inside your handleSubmit in Login.js:
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name || 'Admin');
            localStorage.setItem('userEmail', data.user.email || ''); 

            // REDIRECT LOGIC
            if (data.user.role === 'admin') {
                navigate('/admin'); // Admin always goes to Panel
            } else {
                navigate('/'); // Users go to Home so they can use the search box
            }
            window.location.reload(); // Refresh to update the Navbar state
        } else {
            alert(data.message || "Invalid Credentials");
        }
    } catch (err) {
        alert("Login failed");
    }
};
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoCircle}>🚍</div>
                <h2 style={styles.title}>ApniBus</h2>
                <p style={styles.subtitle}>Enter details to track your bus</p>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" placeholder="Email" style={styles.input} required
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                    <input 
                        type="password" placeholder="Password" style={styles.input} required
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <button type="submit" style={styles.button}>LOG IN</button>
                </form>
                <p style={{marginTop:'15px', fontSize:'14px'}}>
                    Don't have an account? <span onClick={() => window.location.href='/signup'} style={styles.link}>Sign up</span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2563eb' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: '340px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
    logoCircle: { width: '50px', height: '50px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '24px' },
    title: { margin: 0, color: '#1e293b', fontWeight: 'bold' },
    subtitle: { color: '#64748b', marginBottom: '25px', fontSize: '14px' },
    input: { width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' },
    button: { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    link: { color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;