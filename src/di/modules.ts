import { SupabasePlaceRepository } from "@/data/repositories/supabase-place.repository";
import { GetFeaturedPlacesUseCase } from "@/domain/use-cases/get-featured-places.usecase";
import { SupabaseCategoryRepository } from "@/data/repositories/supabase-category.repository";
import { GetCategoriesUseCase } from "@/domain/use-cases/get-categories.usecase";
import { GetPlacesByCategoryUseCase } from "@/domain/use-cases/get-places-by-category.usecase";
import { GetPlaceBySlugUseCase } from "@/domain/use-cases/get-place-by-slug.usecase";
import { SearchPlacesUseCase } from "@/domain/use-cases/search-places.usecase";

import { GetAdminPlacesUseCase } from "@/domain/use-cases/admin/get-admin-places.usecase";
import { CreatePlaceUseCase } from "@/domain/use-cases/admin/create-place.usecase";
import { UpdatePlaceUseCase } from "@/domain/use-cases/admin/update-place.usecase";
import { DeletePlaceUseCase } from "@/domain/use-cases/admin/delete-place.usecase";
import { GetPlaceByIdUseCase } from "@/domain/use-cases/admin/get-place-by-id.usecase";
import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";
import { GetSettingsUseCase } from "@/domain/use-cases/admin/get-settings.usecase";
import { UpdateSettingUseCase } from "@/domain/use-cases/admin/update-setting.usecase";

// Reviews
import { SupabaseReviewRepository } from "@/data/repositories/supabase-review.repository";
import { GetPlaceReviewsUseCase } from "@/domain/use-cases/reviews/get-place-reviews.usecase";
import { GetPlaceRatingStatsUseCase } from "@/domain/use-cases/reviews/get-place-rating-stats.usecase";
import { CreateReviewUseCase } from "@/domain/use-cases/reviews/create-review.usecase";
import { UpdateReviewUseCase } from "@/domain/use-cases/reviews/update-review.usecase";
import { DeleteReviewUseCase } from "@/domain/use-cases/reviews/delete-review.usecase";
import { VoteReviewUseCase } from "@/domain/use-cases/reviews/vote-review.usecase";
import { createClient } from "@/lib/supabase/client";

// 1. Repositories
const placeRepository = new SupabasePlaceRepository();
const categoryRepository = new SupabaseCategoryRepository();
const settingsRepository = new SupabaseSettingsRepository();
const reviewRepository = new SupabaseReviewRepository(createClient());

// 2. Use Cases
export const getFeaturedPlacesUseCase = new GetFeaturedPlacesUseCase(placeRepository);
export const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
export const getPlacesByCategoryUseCase = new GetPlacesByCategoryUseCase(placeRepository);
export const getPlaceBySlugUseCase = new GetPlaceBySlugUseCase(placeRepository);
export const searchPlacesUseCase = new SearchPlacesUseCase(placeRepository);

// Admin Use Cases
export const getAdminPlacesUseCase = new GetAdminPlacesUseCase(placeRepository);
export const createPlaceUseCase = new CreatePlaceUseCase(placeRepository);
export const updatePlaceUseCase = new UpdatePlaceUseCase(placeRepository);
export const deletePlaceUseCase = new DeletePlaceUseCase(placeRepository);
export const getPlaceByIdUseCase = new GetPlaceByIdUseCase(placeRepository);

// Settings Use Cases
export const getSettingsUseCase = new GetSettingsUseCase(settingsRepository);
export const updateSettingUseCase = new UpdateSettingUseCase(settingsRepository);

// Reviews Use Cases
export const getPlaceReviewsUseCase = new GetPlaceReviewsUseCase(reviewRepository);
export const getPlaceRatingStatsUseCase = new GetPlaceRatingStatsUseCase(reviewRepository);
export const createReviewUseCase = new CreateReviewUseCase(reviewRepository);
export const updateReviewUseCase = new UpdateReviewUseCase(reviewRepository);
export const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);
export const voteReviewUseCase = new VoteReviewUseCase(reviewRepository);

