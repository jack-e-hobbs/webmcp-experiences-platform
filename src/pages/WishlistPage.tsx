import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ExperienceCard, { type Experience } from '../components/ExperienceCard';

interface Props {
  experiences: Experience[];
  wishlist: string[];
  onWishlist: (id: string) => void;
}

const WishlistPage: React.FC<Props> = ({ experiences, wishlist, onWishlist }) => {
  const navigate = useNavigate();
  const wishlistedItems = experiences.filter(e => wishlist.includes(e.id));

  return (
    <div className="wishlist-page">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#97b89d', fontSize: '2.5rem' }}>Your Wishlist</h1>
        <p style={{ color: '#666' }}>Your saved experiences, ready for booking.</p>
        <Link to="/" style={{ color: '#97b89d', fontWeight: 'bold', textDecoration: 'none' }}>&larr; Back to Catalog</Link>
      </header>

      {wishlistedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>
          <p style={{ fontSize: '1.2rem' }}>Your wishlist is empty.</p>
          <Link to="/" style={{ color: '#97b89d', textDecoration: 'underline' }}>Browse experiences to save some!</Link>
        </div>
      ) : (
        <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {wishlistedItems.map(exp => (
            <ExperienceCard 
              key={exp.id}
              experience={exp} 
              isWishlisted={true}
              onBook={() => navigate(`/product/${exp.id}`)} 
              onViewDetails={() => navigate(`/product/${exp.id}`)} 
              onWishlist={onWishlist} 
            />
          ))}
        </main>
      )}
    </div>
  );
};

export default WishlistPage;
