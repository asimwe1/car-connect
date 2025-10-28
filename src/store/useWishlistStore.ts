import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WishlistState = {
  wishlist: string[];
  addToWishlist: (carId: string) => void;
  removeFromWishlist: (carId: string) => void;
  isInWishlist: (carId: string) => boolean;
}

export const useWishlistStore = create(
  persist<WishlistState>(
    (set, get) => ({
      wishlist: [],
      addToWishlist: (carId: string) => {
        set((state) => ({
          wishlist: [...state.wishlist, carId],
        }));
      },
      removeFromWishlist: (carId: string) => {
        set((state) => ({
          wishlist: state.wishlist.filter((id) => id !== carId),
        }));
      },
      isInWishlist: (carId: string) => {
        return get().wishlist.includes(carId);
      },
    }),
    {
      name: 'car-wishlist-storage',
    }
  )
);