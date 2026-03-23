import React, { useState } from 'react';
import { type Experience } from './ExperienceCard';

interface Props {
  experience: Experience;
  onCancel: () => void;
  onSubmit: (selectedDate: string) => void;
}

const BookingForm: React.FC<Props> = ({ experience, onCancel, onSubmit }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert("Please select a date to proceed.");
      return;
    }
    onSubmit(selectedDate);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="booking-form" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', position: 'relative', textAlign: 'left' }}>
        <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Complete Your Booking</h2>
        <p style={{ marginBottom: '20px' }}>You are booking: <strong>{experience.name}</strong></p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label htmlFor="date-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Please select a date:</label>
            <select
              id="date-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
            >
              <option value="" disabled>-- Choose a date --</option>
              {experience.availability.map(date => (
                <option key={date} value={date}>{new Date(date).toDateString()}</option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>Payment Details (Secure):</p>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Full Name</label>
              <input type="text" name="name" autoComplete="name" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Card Number</label>
              <input type="text" name="cc-number" autoComplete="cc-number" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="XXXX XXXX XXXX XXXX" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Expiry</label>
                <input type="text" name="cc-exp" autoComplete="cc-exp" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="MM / YY" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>CVC</label>
                <input type="text" name="cc-csc" autoComplete="cc-csc" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="123" />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f8f9fa', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            <button type="submit" disabled={!selectedDate} style={{ flex: 2, padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: !selectedDate ? '#ccc' : '#4CAF50', color: 'white', fontWeight: 'bold', cursor: !selectedDate ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>Pay & Confirm ${experience.price.toFixed(2)}</button>
          </div>
        </form>
        
        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '15px', fontStyle: 'italic' }}>
          🔒 This is a secure booking form. For agent-native transactions, your payment details are protected by browser-level HITL verification.
        </p>
      </div>
    </div>
  );
};

export default BookingForm;
