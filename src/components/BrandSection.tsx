import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandService, Brand } from '@/services/brandService';
import LoadingSpinner from '@/components/LoadingSpinner';

// Fallback brands in case API fails
const fallbackBrands = [
  { name: 'Toyota', logo: '/placeholder.svg', count: '120+ Models' },
  { name: 'Porsche', logo: '/placeholder.svg', count: '35+ Models' },
  { name: 'Kia', logo: '/placeholder.svg', count: '85+ Models' },
  { name: 'Nissan', logo: '/placeholder.svg', count: '95+ Models' },
  { name: 'Mercedes-Benz', logo: '/placeholder.svg', count: '75+ Models' },
  { name: 'BMW', logo: '/placeholder.svg', count: '60+ Models' },
  { name: 'Land Rover', logo: '/placeholder.svg', count: '25+ Models' },
  { name: 'Dodge', logo: '/placeholder.svg', count: '40+ Models' },
  { name: 'Audi', logo: '/placeholder.svg', count: '50+ Models' },
  { name: 'Ford', logo: '/placeholder.svg', count: '110+ Models' },
  { name: 'Chevrolet', logo: '/placeholder.svg', count: '20+ Models' },
  { name: 'Range Rover', logo: '/placeholder.svg', count: '10+ Models' },
];

const BrandSection = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await brandService.getActiveBrands();
        
        if (response.error) {
          console.warn('Failed to fetch brands from API, using fallback:', response.error);
          setBrands(fallbackBrands as Brand[]);
        } else {
          setBrands(response.data || fallbackBrands as Brand[]);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError('Failed to load brands');
        setBrands(fallbackBrands as Brand[]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandClick = (brandName: string) => {
    navigate(`/buy-cars?brand=${encodeURIComponent(brandName)}`);
  };

  return (
    <section id="premium-brands" className="py-20 bg-gradient-to-b from-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Premium Brands
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore vehicles from the world's most prestigious automotive manufacturers
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.map((brand, index) => (
              <div
                key={brand.name}
                className={`brand-card group cursor-pointer fade-in-up stagger-delay-${(index % 4) + 1}`}
                onClick={() => handleBrandClick(brand.name)}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{brand.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12 fade-in-up stagger-delay-4">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary"></div>
            <span className="text-sm font-medium">And many more premium brands</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;