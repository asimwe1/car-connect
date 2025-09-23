export interface LocalCar {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  primaryImage: string;
  location?: string;
  bodyType?: string;
  color?: string;
}

// Images reference files under public/cars/*.jpg
export const localCars: LocalCar[] = [
  {
    _id: 'loc-1',
    make: 'Audi',
    model: 'A4',
    year: 2018,
    price: 22000,
    mileage: 52000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    status: 'available',
    primaryImage: '/cars/audi-a4.jpg',
    images: ['/cars/audi-a4.jpg'],
    bodyType: 'sedan',
    location: 'Kigali',
    color: 'Silver'
  },
  {
    _id: 'loc-2',
    make: 'BMW',
    model: 'X5',
    year: 2017,
    price: 28000,
    mileage: 69000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    status: 'available',
    primaryImage: '/cars/bmw-x5.jpg',
    images: ['/cars/bmw-x5.jpg'],
    bodyType: 'suv',
    location: 'Huye',
    color: 'Black'
  },
  {
    _id: 'loc-3',
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    price: 16500,
    mileage: 31000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    status: 'available',
    primaryImage: '/cars/honda-civic.jpg',
    images: ['/cars/honda-civic.jpg'],
    bodyType: 'sedan',
    location: 'Musanze',
    color: 'Red'
  },
  {
    _id: 'loc-4',
    make: 'Tesla',
    model: 'Model 3',
    year: 2021,
    price: 32000,
    mileage: 18000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    status: 'available',
    primaryImage: '/cars/tesla-model-3.jpg',
    images: ['/cars/tesla-model-3.jpg'],
    bodyType: 'sedan',
    location: 'Kigali',
    color: 'Gray'
  },
  {
    _id: 'loc-5',
    make: 'Toyota',
    model: 'RAV4',
    year: 2019,
    price: 24500,
    mileage: 42000,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    status: 'available',
    primaryImage: '/cars/toyota-rav4.jpg',
    images: ['/cars/toyota-rav4.jpg'],
    bodyType: 'suv',
    location: 'Rubavu',
    color: 'Blue'
  },
  {
    _id: 'loc-6',
    make: 'Nissan',
    model: 'Qashqai',
    year: 2017,
    price: 14500,
    mileage: 72000,
    fuelType: 'Diesel',
    transmission: 'Manual',
    status: 'available',
    primaryImage: '/cars/nissan-qashqai.jpg',
    images: ['/cars/nissan-qashqai.jpg'],
    bodyType: 'crossover',
    location: 'Kigali',
    color: 'Orange'
  },
  {
    _id: 'loc-7',
    make: 'Mercedes Benz',
    model: 'GLC',
    year: 2023,
    price: 95000,
    mileage: 50,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    status: 'available',
    primaryImage: '/cars/mercedes-glc.jpg',
    images: ['/cars/mercedes-glc.jpg'],
    bodyType: 'suv',
    location: 'Kigali',
    color: 'White'
  },
  {
    _id: 'loc-8',
    make: 'Ford',
    model: 'Ranger',
    year: 2022,
    price: 36000,
    mileage: 12000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    status: 'available',
    primaryImage: '/cars/ford-ranger.jpg',
    images: ['/cars/ford-ranger.jpg'],
    bodyType: 'pickup',
    location: 'Rusizi',
    color: 'Blue'
  }
];
