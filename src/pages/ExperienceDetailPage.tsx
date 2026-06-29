import React from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Experience } from '../components/ExperienceCard';

interface Props {
  experiences: Experience[];
  onInitiateBooking: (id: string) => void;
}

const ExperienceDetailPage: React.FC<Props> = ({ experiences, onInitiateBooking }) => {
  const { id } = useParams();
  const experience = experiences.find(e => e.id === id);

  if (!experience) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Experience not found. <Link to="/">Back to Catalog</Link></div>;
  }

  return (
    <div className="experience-detail-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'left' }}>
      <Link to="/" style={{ color: '#97b89d', fontWeight: 'bold', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>&larr; Back to Catalog</Link>
      
      <h1>{experience.name}</h1>
      
      <div style={{ display: 'flex', gap: '10px', color: '#666', marginBottom: '30px' }}>
        <span>{experience.location}</span>
        <span>•</span>
        <span style={{ color: '#f39c12' }}>★ {experience.starRating}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <h3>Description</h3>
          <p style={{ lineHeight: '1.6' }}>{experience.description}</p>
          
          <h3>What's Included</h3>
          <ul>
            {experience.inclusions.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>

        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0 }}>Book Now</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${experience.price.toFixed(2)}</p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Includes {experience.minPartySize}-{experience.maxPartySize} guests.</p>
          <button 
            onClick={() => onInitiateBooking(experience.id)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#97b89d', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            Select Dates
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetailPage;
