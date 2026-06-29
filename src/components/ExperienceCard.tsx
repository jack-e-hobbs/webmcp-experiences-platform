import React from 'react';

export interface Experience {
  id: string;
  name: string;
  location: string;
  region: string;
  starRating: number;
  description: string;
  price: number;
  minPartySize: number;
  maxPartySize: number;
  availability: string[];
  keywords: string[];
  inclusions: string[];
  startTime: string;
  endTime: string;
}

interface Props {
  experience: Experience;
  isWishlisted: boolean;
  onBook: () => void;
  onViewDetails: () => void;
  onWishlist: (id: string) => void;
}

const ExperienceCard: React.FC<Props> = ({ experience, isWishlisted, onBook, onViewDetails, onWishlist }) => {
  return (
    <div 
      className="experience-card" 
      onClick={onViewDetails}
      style={{ 
        border: '1px solid #eee', 
        borderRadius: '12px', 
        padding: '20px', 
        position: 'relative',
        cursor: 'pointer',
        textAlign: 'left',
        backgroundColor: '#fff',
        transition: 'box-shadow 0.3s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onWishlist(experience.id);
        }}
        style={{ 
          position: 'absolute', 
          top: '15px', 
          right: '15px', 
          background: 'rgba(255,255,255,0.9)', 
          border: 'none', 
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {isWishlisted ? '❤️' : '♡'}
      </button>

      <h3 style={{ margin: '0 0 10px 0', paddingRight: '40px' }}>{experience.name}</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', color: '#666' }}>
        <span style={{ color: '#f39c12' }}>★</span>
        <span>{experience.starRating}</span>
        <span style={{ margin: '0 5px' }}>•</span>
        <span>{experience.location}</span>
      </div>

      <p style={{ color: '#444', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4' }}>
        {experience.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '20px' }}>
        {experience.keywords.map(kw => (
          <span key={kw} style={{ backgroundColor: '#f0f0f0', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#666' }}>
            {kw}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#97b89d' }}>
          ${experience.price.toFixed(2)}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
          style={{ 
            backgroundColor: '#97b89d', 
            color: '#fff', 
            border: 'none', 
            padding: '8px 20px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ExperienceCard;
