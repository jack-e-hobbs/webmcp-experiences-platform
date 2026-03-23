import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Experience } from '../components/ExperienceCard';

interface Props {
  experiences: Experience[];
  isWishlisted: boolean;
  onView: (id: string) => void;
  onInitiateBooking: (id: string, date: string, partySize: number) => void;
  onWishlist: (id: string) => void;
}

const ProductPage: React.FC<Props> = ({ experiences, isWishlisted, onView, onInitiateBooking, onWishlist }) => {
  const { id } = useParams();
  const experience = experiences.find(e => e.id === id);
  const [selectedDate, setSelectedDate] = React.useState('');
  const hasTracked = useRef<string | null>(null);

  useEffect(() => {
    if (id && hasTracked.current !== id) {
      onView(id);
      hasTracked.current = id;
    }
  }, [id, onView]);

  if (!experience) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Experience not found. <Link to="/">Back to Catalog</Link></div>;
  }

  const handleBooking = () => {
    if (!selectedDate) {
      alert("Please select a date first!");
      return;
    }
    onInitiateBooking(experience.id, selectedDate, experience.minPartySize);
  };

  return (
    <div className="product-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px', textAlign: 'left' }}>
      <Link to="/" style={{ color: '#97b89d', fontWeight: 'bold', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>&larr; Back to Catalog</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{experience.name}</h1>
        <button 
          onClick={() => onWishlist(experience.id)}
          style={{ 
            fontSize: '2rem', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            color: isWishlisted ? '#97b89d' : '#ccc',
            transition: 'transform 0.2s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isWishlisted ? '❤️' : '♡'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
        <span>{experience.location}</span>
        <span>•</span>
        <span style={{ color: '#f39c12' }}>★ {experience.starRating}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <h3>Description</h3>
          <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{experience.description}</p>
          
          <h3>What's Included</h3>
          <ul style={{ lineHeight: '1.8' }}>
            {experience.inclusions.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>

        <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '12px', border: '1px solid #eee', position: 'sticky', top: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Book Your Spot</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Number of Guests</label>
            <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #ddd' }}>
              Fixed for {experience.minPartySize} people
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Date</label>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">-- Choose a Date --</option>
              {experience.availability.map(date => (
                <option key={date} value={date}>{new Date(date).toDateString()}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
            Total: ${experience.price.toFixed(2)}
          </div>

          <button 
            onClick={handleBooking}
            style={{ 
              width: '100%', 
              padding: '16px', 
              backgroundColor: '#97b89d', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            Initiate Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
