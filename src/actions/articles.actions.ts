'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    createArticleUseCase,
    updateArticleUseCase,
    deleteArticleUseCase,
    getUserRoleUseCase,
    getArticleByIdUseCase,
    getAdminArticlesUseCase
} from "@/di/modules";
import { CreateArticleDTO, UpdateArticleDTO } from "@/domain/entities/article";

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    const role = await getUserRoleUseCase.execute(user.id, supabase);
    if (role !== "admin") {
        throw new Error("Forbidden: Admin access required");
    }

    return { supabase, user };
}

export async function createNewArticle(formData: FormData) {
    const { supabase, user } = await checkAdmin();

    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const cover_image_url = formData.get("cover_image_url") as string;
    const category = formData.get("category") as string;
    const is_published = formData.get("is_published") === "true";

    if (!title || !content || !category) {
        throw new Error("Missing required fields");
    }

    const articleData: CreateArticleDTO = {
        title,
        excerpt,
        content,
        cover_image_url,
        author_id: user.id,
        category,
        is_published
    };

    await createArticleUseCase.execute(articleData, supabase);
    revalidatePath("/admin/articles");
    return { success: true };
}

export async function updateArticle(id: string, formData: FormData) {
    const { supabase } = await checkAdmin();

    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const cover_image_url = formData.get("cover_image_url") as string;
    const category = formData.get("category") as string;
    const is_published = formData.get("is_published") === "true";

    const articleData: UpdateArticleDTO = {
        id,
        title,
        excerpt,
        content,
        cover_image_url,
        category,
        is_published
    };

    await updateArticleUseCase.execute(articleData, supabase);
    revalidatePath("/admin/articles");
    revalidatePath(`/news/${id}`);
    return { success: true };
}

export async function deleteArticle(id: string) {
    const { supabase } = await checkAdmin();
    await deleteArticleUseCase.execute(id, supabase);
    revalidatePath("/admin/articles");
}

export async function getAdminArticles(limit: number = 20, offset: number = 0) {
    const { supabase } = await checkAdmin();
    return await getAdminArticlesUseCase.execute(limit, offset, supabase);
}

export async function getArticleForEdit(id: string) {
    const { supabase } = await checkAdmin();
    return await getArticleByIdUseCase.execute(id, supabase);
}
export async function toggleArticleStatus(id: string, isPublished: boolean) {
    const { supabase } = await checkAdmin();

    // We only need to update the is_published field
    // Since updateArticleUseCase expects a full DTO, we might need to fetch the article first OR 
    // better, let's just use the repository directly or create a specific use case if we want to be strict.
    // For now, to be quick and clean, I'll use the existing updateArticleUseCase but I need to provide the other fields?
    // standard updateArticleUseCase takes Partial? let's check.
    // actually updateArticleUseCase takes UpdateArticleDTO which has optional fields. 
    // Let's verify UpdateArticleDTO in src/domain/entities/article.ts first.

    const articleData: UpdateArticleDTO = {
        id,
        is_published: isPublished
    };

    await updateArticleUseCase.execute(articleData, supabase);
    revalidatePath("/admin/articles");
    revalidatePath(`/news/${id}`);
    revalidatePath("/"); // In case it was on home page
}
