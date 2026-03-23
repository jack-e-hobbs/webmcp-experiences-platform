import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExperienceCard, { type Experience } from '../components/ExperienceCard';

interface Props {
  experiences: Experience[];
  filters: any;
  wishlist: string[];
  onSearch: (filters: any) => void;
  onWishlist: (id: string) => void;
}

const HomePage: React.FC<Props> = ({ experiences, filters, wishlist, onSearch, onWishlist }) => {
  const navigate = useNavigate();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSearchChange = (key: string, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onSearch(updated);
  };

  return (
    <div className="home-page">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#97b89d', fontSize: '2.5rem' }}>AmazingExperiences</h1>
        <p style={{ color: '#666' }}>Agent-Native Discovery & Booking Platform</p>
      </header>

      {/* 
          DECLARATIVE API DEMO:
          Adding 'toolname' and 'tooldescription' attributes allows AI agents to 
          understand and interact with these fields without any JavaScript logic.
      */}
      <div className="search-controls" style={{ marginBottom: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="City (e.g. Sydney)" 
          value={localFilters.location || ''} 
          onChange={(e) => handleSearchChange('location', e.target.value)}
          style={{ padding: '12px', width: '200px', borderRadius: '6px', border: '1px solid #ccc' }}
          // @ts-ignore - Experimental WebMCP Attributes
          toolname="filter_by_location"
          tooldescription="Filters the catalog to a specific city or region."
        />
        <select 
          value={localFilters.partySize || ''} 
          onChange={(e) => handleSearchChange('partySize', parseInt(e.target.value) || undefined)}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
          // @ts-ignore - Experimental WebMCP Attributes
          toolname="filter_by_party_size"
          tooldescription="Sets the number of guests for the adventure."
        >
          <option value="">Any Party Size</option>
          {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Guests</option>)}
        </select>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: '#666' }}>From:</label>
          <input 
            type="date"
            value={localFilters.startDate || ''}
            onChange={(e) => handleSearchChange('startDate', e.target.value)}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            // @ts-ignore - Experimental WebMCP Attributes
            toolname="filter_start_date"
            tooldescription="The earliest date the user is available."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: '#666' }}>To:</label>
          <input 
            type="date"
            value={localFilters.endDate || ''}
            onChange={(e) => handleSearchChange('endDate', e.target.value)}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            // @ts-ignore - Experimental WebMCP Attributes
            toolname="filter_end_date"
            tooldescription="The latest date the user is available."
          />
        </div>
      </div>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {experiences.map(exp => (
          <ExperienceCard 
            key={exp.id}
            experience={exp} 
            isWishlisted={wishlist.includes(exp.id)}
            onBook={() => navigate(`/product/${exp.id}`)} 
            onViewDetails={() => navigate(`/product/${exp.id}`)} 
            onWishlist={onWishlist} 
          />
        ))}
        {experiences.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: '#888' }}>
            <p style={{ fontSize: '1.2rem' }}>No experiences found matching your filters.</p>
            <button 
              onClick={() => { setLocalFilters({}); onSearch({}); }}
              style={{ backgroundColor: 'transparent', border: 'none', color: '#97b89d', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
