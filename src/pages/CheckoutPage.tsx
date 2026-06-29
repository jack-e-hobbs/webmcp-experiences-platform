import React from 'react';
import { Link } from 'react-router-dom';
import type { Experience } from '../components/ExperienceCard';

interface Props {
  bookingRequest: { experience: Experience, date?: string, partySize?: number } | null;
  onSubmit: (selectedDate: string) => void;
}

const CheckoutPage: React.FC<Props> = ({ bookingRequest, onSubmit }) => {
  if (!bookingRequest) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>No active booking found.</h2>
        <Link to="/" style={{ color: '#97b89d', fontWeight: 'bold' }}>Return to Catalog</Link>
      </div>
    );
  }

  const { experience, date, partySize } = bookingRequest;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The App component handles navigation to /confirmation within the onSubmit handler
    onSubmit(date || '');
  };

  return (
    <div className="checkout-page" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', textAlign: 'left' }}>
      <Link to={`/product/${experience.id}`} style={{ color: '#97b89d', fontWeight: 'bold', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>&larr; Back to Experience</Link>
      
      <h1>Secure Checkout</h1>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #eee' }}>
        <h3 style={{ marginTop: 0 }}>Booking Summary</h3>
        <p><strong>Experience:</strong> {experience.name}</p>
        <p><strong>Date:</strong> {date ? new Date(date).toDateString() : 'Not selected'}</p>
        <p><strong>Guests:</strong> {partySize}</p>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333', marginTop: '10px' }}>Total Amount: ${experience.price.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Name</label>
          <input type="text" name="name" autoComplete="name" required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Card Details</label>
          <input type="text" name="cc-number" autoComplete="cc-number" required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="XXXX XXXX XXXX XXXX" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" name="cc-exp" autoComplete="cc-exp" required style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="MM / YY" />
            <input type="text" name="cc-csc" autoComplete="cc-csc" required style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="CVC" />
          </div>
        </div>

        <button 
          type="submit"
          style={{ width: '100%', padding: '16px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}
        >
          Pay & Confirm Booking
        </button>
      </form>

      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '20px', textAlign: 'center' }}>
        🔒 Your payment is secured with industry-standard encryption.
      </p>
    </div>
  );
};

export default CheckoutPage;
