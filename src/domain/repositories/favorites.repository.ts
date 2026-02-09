import { Place } from "../entities/place";

export interface IFavoritesRepository {
    addFavorite(userId: string, placeId: string): Promise<void>;
    removeFavorite(userId: string, placeId: string): Promise<void>;
    isFavorite(userId: string, placeId: string): Promise<boolean>;
    getUserFavorites(userId: string): Promise<Place[]>; // Returns places
}
