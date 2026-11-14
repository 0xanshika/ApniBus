import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const Booking = () => {
    // Generate 40 seats (1 to 40)
    const [selectedSeats, setSelectedSeats] = useState([]);
    const seatPrice = 550; // Flat rate per seat

    // Mock occupied seats (usually these come from your Backend/DB)
    const occupiedSeats = [3, 8, 12, 25, 26];

    const toggleSeat = (seatId) => {
        if (occupiedSeats.includes(seatId)) return; // Can't click occupied seats

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Navbar />
            
            <div style={styles.container}>
                <div style={styles.layout}>
                    
                    {/* Left Side: Seat Grid */}
                    <div style={styles.seatCard}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Select Your Seats</h3>
                        
                        <div style={styles.busFront}>(Driver)</div>

                        <div style={styles.grid}>
                            {[...Array(40)].map((_, index) => {
                                const seatNumber = index + 1;
                                const isOccupied = occupiedSeats.includes(seatNumber);
                                const isSelected = selectedSeats.includes(seatNumber);

                                return (
                                    <div
                                        key={seatNumber}
                                        onClick={() => toggleSeat(seatNumber)}
                                        style={{
                                            ...styles.seat,
                                            backgroundColor: isOccupied ? '#cbd5e1' : isSelected ? '#2563eb' : '#fff',
                                            color: isSelected ? '#fff' : '#000',
                                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                                            border: isSelected ? '2px solid #1e40af' : '2px solid #e2e8f0'
                                        }}
                                    >
                                        {seatNumber}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div style={styles.legend}>
                            <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor: '#fff', border: '1px solid #ddd'}}></span> Available</div>
                            <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor: '#2563eb'}}></span> Selected</div>
                            <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor: '#cbd5e1'}}></span> Booked</div>
                        </div>
                    </div>

                    {/* Right Side: Price Summary */}
                    <div style={styles.summaryCard}>
                        <h3 style={{ marginTop: 0 }}>Booking Summary</h3>
                        <p style={styles.summaryText}><b>Bus:</b> APNI-101 (Sleeper/AC)</p>
                        <p style={styles.summaryText}><b>Seats:</b> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}</p>
                        <hr style={styles.hr} />
                        <div style={styles.totalRow}>
                            <span>Total Price:</span>
                            <span style={styles.price}>₹{selectedSeats.length * seatPrice}</span>
                        </div>
                        <button 
                            disabled={selectedSeats.length === 0}
                            style={{
                                ...styles.confirmBtn,
                                backgroundColor: selectedSeats.length === 0 ? '#94a3b8' : '#2563eb'
                            }}
                            onClick={() => alert(`Proceeding to pay ₹${selectedSeats.length * seatPrice}`)}
                        >
                            Confirm Booking
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px 50px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', maxWidth: '1100px', margin: '0 auto' },
    seatCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    summaryCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', height: 'fit-content' },
    busFront: { width: '100%', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold', color: '#64748b' },
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px', 
        paddingRight: '20px',
        // Creating the bus aisle effect
        columnGap: '40px' 
    },
    seat: { 
        height: '45px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: '8px', 
        fontSize: '14px', 
        fontWeight: 'bold',
        transition: 'all 0.2s'
    },
    legend: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' },
    legendItem: { display: 'flex', alignItems: 'center', fontSize: '13px', color: '#64748b' },
    dot: { width: '12px', height: '12px', borderRadius: '3px', marginRight: '8px' },
    summaryText: { fontSize: '15px', color: '#475569', margin: '10px 0' },
    hr: { border: '0', borderTop: '1px solid #f1f5f9', margin: '20px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    price: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
    confirmBtn: { width: '100%', padding: '15px', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }
};

export default Booking;