import React, { useState } from 'react';
import type { Experience } from './ExperienceCard';

interface Props {
  experience: Experience;
  isWishlisted: boolean;
  onClose: () => void;
  onWishlist: (id: string) => void;
  onInitiateBooking: (id: string, date: string, partySize: number) => void;
}

const ExperienceModal: React.FC<Props> = ({ experience, isWishlisted, onClose, onWishlist, onInitiateBooking }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPartySize, setSelectedPartySize] = useState<number>(experience?.minPartySize || 2);

  if (!experience) return null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlist(experience.id);
  };

  const handleBooking = () => {
    if (!selectedDate) {
      alert("Please select a date to book.");
      return;
    }
    onInitiateBooking(experience.id, selectedDate, selectedPartySize);
    onClose();
  };

  // Generate range of party sizes
  const partySizeOptions = [];
  for (let i = experience.minPartySize; i <= experience.maxPartySize; i++) {
    partySizeOptions.push(i);
  }

  const isFixedSize = experience.minPartySize === experience.maxPartySize;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', textAlign: 'left' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 3 }}>&times;</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, paddingRight: '50px' }}>{experience.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={handleWishlistClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem', marginRight: '16px', padding: 0 }}>
              {isWishlisted ? <span style={{color: 'red'}}>♥</span> : '♡'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#ffc107' }}>
              <span style={{ marginRight: '4px' }}>&#9733;</span>
              <span>{experience.starRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <p><strong>{experience.location} ({experience.region})</strong></p>
        <p style={{ lineHeight: '1.6' }}>{experience.description}</p>
        
        <h4 style={{ marginBottom: '8px' }}>Inclusions:</h4>
        <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0' }}>
          {experience.inclusions.map((item, index) => (
            <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
          ))}
        </ul>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '8px' }}>Guests:</h4>
            {isFixedSize ? (
              <p style={{ margin: 0, padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #eee' }}>
                Fixed for <strong>{experience.minPartySize} guests</strong>
              </p>
            ) : (
              <select
                value={selectedPartySize}
                onChange={(e) => setSelectedPartySize(parseInt(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
              >
                {partySizeOptions.map(size => (
                  <option key={size} value={size}>{size} Guests</option>
                ))}
              </select>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '8px' }}>Keywords:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {experience.keywords.map(keyword => (
                <span key={keyword} style={{ backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{keyword}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="modal-date-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select a Date to Book:</label>
            <select
              id="modal-date-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
            >
              <option value="" disabled>-- Choose a date --</option>
              {experience.availability.map(date => (
                <option key={date} value={date}>{new Date(date).toDateString()}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>${experience.price.toFixed(2)}</p>
            <button 
              onClick={handleBooking}
              disabled={!selectedDate}
              style={{ backgroundColor: !selectedDate ? '#ccc' : '#97b89d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: !selectedDate ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
            >
              Book this Date
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;
