import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const navigate = useNavigate();

    // Inside your Home.js component:

// Inside Home.js
const handleSearch = () => {
    const token = localStorage.getItem('token');
    
    if (!from || !to) {
        return alert("Please enter both Departure and Destination");
    }

    if (!token) {
        alert("Please Login first to track live buses!");
        navigate('/login'); 
    } else {
        // If logged in, NOW they can see the dashboard
        navigate("/dashboard", { state: { from, to } });
    }
};

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <Navbar />
            
            <header style={styles.hero}>
                <h1 style={styles.title}>
                    Effortless & Reliable <br />
                    <span style={{ color: '#2563eb' }}>Bus Tracking</span>
                </h1>
                <p style={styles.subtitle}>Track buses in real time and travel smarter.</p>

                {/* DUAL INPUT SEARCH BOX */}
                <div style={styles.searchBox}>
                    <input 
                        type="text" placeholder="From (e.g. Delhi)" style={styles.input}
                        value={from} onChange={(e) => setFrom(e.target.value)}
                    />
                    <div style={styles.divider}>⇄</div>
                    <input 
                        type="text" placeholder="To (e.g. Chandigarh)" style={styles.input}
                        value={to} onChange={(e) => setTo(e.target.value)}
                    />
                    <button onClick={handleSearch} style={styles.btn}>Search Bus</button>
                </div>
            </header>

            <section style={styles.features}>
                <div style={styles.card}><h3>Digital Wallet</h3></div>
                <div style={styles.card}><h3>Live Tracking</h3></div>
                <div style={styles.card}><h3>Smart ETA</h3></div>
            </section>
        </div>
    );
};

const styles = {
    hero: { textAlign: 'center', padding: '80px 20px' },
    title: { fontSize: '48px', fontWeight: 'bold', color: '#1e293b' },
    subtitle: { color: '#64748b', margin: '20px 0 40px' },
    searchBox: { 
        display: 'inline-flex', alignItems: 'center', backgroundColor: 'white', 
        padding: '10px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        gap: '10px'
    },
    input: { padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', width: '200px', outline: 'none' },
    divider: { fontSize: '20px', color: '#2563eb', fontWeight: 'bold' },
    btn: { padding: '15px 30px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    features: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '15px', width: '200px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }
};

export default Home;