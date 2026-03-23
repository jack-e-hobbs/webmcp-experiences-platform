import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  booking: {
    transactionId: string;
    experienceName: string;
    date: string;
    partySize: number;
    totalValue: number;
  } | null;
}

const ConfirmationPage: React.FC<Props> = ({ booking }) => {
  if (!booking) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>No booking found.</h2>
        <Link to="/" style={{ color: '#97b89d', fontWeight: 'bold' }}>Return to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page" style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✅</div>
      <h1 style={{ color: '#4CAF50', marginBottom: '10px' }}>Booking Confirmed!</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
        Pack your bags! Your adventure is officially on the calendar.
      </p>

      <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '12px', textAlign: 'left', border: '1px solid #eee', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Booking Details</h3>
        <p><strong>Experience:</strong> {booking.experienceName}</p>
        <p><strong>Date:</strong> {new Date(booking.date).toDateString()}</p>
        <p><strong>Guests:</strong> {booking.partySize}</p>
        <p><strong>Total Paid:</strong> ${booking.totalValue.toFixed(2)}</p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '20px' }}>
          <strong>Transaction ID:</strong> {booking.transactionId}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/" style={{ padding: '12px 30px', borderRadius: '8px', border: '1px solid #ccc', textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
          Back to Home
        </Link>
        <Link to="/wishlist" style={{ padding: '12px 30px', borderRadius: '8px', backgroundColor: '#97b89d', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
          View Wishlist
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;
