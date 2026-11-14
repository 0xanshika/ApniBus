import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from 'react-leaflet';

import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

import 'leaflet/dist/leaflet.css';

const ROUTES = {
  "delhi-chandigarh": [
    [28.6139, 77.2090],
    [29.3909, 76.9635],
    [30.3752, 76.7821],
    [30.7333, 76.7794]
  ],

  "delhi-jaipur": [
    [28.6139, 77.2090],
    [27.8974, 76.2760],
    [27.5529, 76.6346],
    [26.9124, 75.7873]
  ],

  "delhi-agra": [
    [28.6139, 77.2090],
    [28.4089, 77.3178],
    [27.4924, 77.6737],
    [27.1767, 78.0081]
  ],

  "chandigarh-delhi": [
    [30.7333, 76.7794],
    [30.3752, 76.7821],
    [29.3909, 76.9635],
    [28.6139, 77.2090]
  ]
};


const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');

  const searchData = location.state || {
    from: 'Delhi',
    to: 'Chandigarh'
  };

  const routeKey =
  `${searchData.from}-${searchData.to}`.toLowerCase();

  const routeCoordinates =
  ROUTES[routeKey] || ROUTES["delhi-chandigarh"];

  const [currentIndex, setCurrentIndex] = useState(0);

  const [busPos, setBusPos] = useState({
    lat: routeCoordinates[0][0],
    lng: routeCoordinates[0][1],
    eta: '30 mins'
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next =
          prev === routeCoordinates.length - 1
            ? 0
            : prev + 1;

        setBusPos({
          lat: routeCoordinates[next][0],
          lng: routeCoordinates[next][1],
          eta: `${(routeCoordinates.length - next) * 10} mins`
        });

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw'
      }}
    >
      <Navbar />

      <div style={styles.mainContent}>
        <aside style={styles.sidebar}>
          <div style={styles.infoCard}>
            <h2
              style={{
                color: '#2563eb',
                marginTop: 0
              }}
            >
              Live Tracking
            </h2>

            <p style={styles.text}>
              <b>From:</b> {searchData.from}
            </p>

            <p style={styles.text}>
              <b>To:</b> {searchData.to}
            </p>

            <hr style={styles.hr} />

            <p style={styles.text}>
              <b>Bus ID:</b> APNI-101
            </p>

            <p style={styles.text}>
              <b>ETA:</b>{' '}
              <span style={{ color: '#2563eb' }}>
                {busPos.eta}
              </span>
            </p>
          </div>

          <button
            style={styles.bookBtn}
            onClick={() => navigate('/booking')}
          >
            Book Seat Now
          </button>
        </aside>

        <section style={styles.mapArea}>
          <MapContainer
            center={routeCoordinates[0]}
            zoom={8}
            style={{
              height: '100%',
              width: '100%'
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polyline positions={routeCoordinates} />

            <Marker
              position={[
                busPos.lat,
                busPos.lng
              ]}
            >
              <Popup>
                <b>APNI-101</b>
                <br />
                {searchData.from} → {searchData.to}
              </Popup>
            </Marker>

            <Marker
              position={routeCoordinates[0]}
            >
              <Popup>{searchData.from}</Popup>
            </Marker>

            <Marker
              position={
                routeCoordinates[
                  routeCoordinates.length - 1
                ]
              }
            >
              <Popup>{searchData.to}</Popup>
            </Marker>
          </MapContainer>
        </section>
      </div>
    </div>
  );
};

const styles = {
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },

  sidebar: {
    width: '320px',
    padding: '25px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
  },

  infoCard: {
    backgroundColor: '#f0f7ff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #dbeafe'
  },

  text: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#1e293b'
  },

  hr: {
    margin: '15px 0',
    border: '0',
    borderTop: '1px solid #cbd5e1'
  },

  bookBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer'
  },

  mapArea: {
    flex: 1
  }
};

export default Dashboard;