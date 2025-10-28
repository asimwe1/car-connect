import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface Brand {
  _id: string;
  name: string;
  logo: string;
  count: number;
}

const BrandSection = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        const response = await api.getBrands();
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data?.data?.brands) {
          setBrands(response.data.data.brands);
        } else {
          setBrands([]);
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setError('Failed to load brands. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandClick = (brandName) => {
    navigate(`/buy-cars?brand=${encodeURIComponent(brandName)}`);
  };

  return (
    <section id='premium-brands' className="py-20 bg-gradient-to-b from-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Premium Brands
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore vehicles from the world's most prestigious automotive manufacturers
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center text-destructive my-8">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && brands.length === 0 && (
          <div className="text-center text-muted-foreground my-8">
            <p>No brands available at the moment.</p>
          </div>
        )}

        {!isLoading && !error && brands.length > 0 && (
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
                  <p className="text-sm text-muted-foreground">{brand.count}+ Models</p>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!isLoading && !error && brands.length > 0 && (
          <div className="text-center mt-12 fade-in-up stagger-delay-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary"></div>
              <span className="text-sm font-medium">And many more premium brands</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandSection;