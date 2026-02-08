'use server'

import { createClient } from '@/lib/supabase/server'
import { logAudit, generateChangesSummary } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type CategoryState = {
    errors?: {
        name?: string[]
        slug?: string[]
        icon?: string[]
        _form?: string[]
    }
    message?: string
}

export async function createCategory(prevState: CategoryState, formData: FormData): Promise<CategoryState> {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const icon = formData.get('icon') as string
    const is_featured = formData.get('is_featured') === 'true'
    const sort_order = parseInt(formData.get('sort_order') as string) || 0

    // Basic validation
    if (!name || name.length < 3) {
        return { errors: { name: ['Name must be at least 3 characters'] } }
    }
    if (!slug) {
        return { errors: { slug: ['Slug is required'] } }
    }

    const supabase = await createClient()

    try {
        // 1. Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { errors: { _form: ['Not authenticated'] } }
        }

        // 2. Check Super Admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            return { errors: { _form: ['Access denied. Only Super Admin can manage categories.'] } }
        }

        // 3. Insert category (no created_by needed)
        const { data, error } = await supabase
            .from('categories')
            .insert({ name, slug, icon, is_featured, sort_order })
            .select()
            .single()

        if (error) {
            console.error('Create category error:', error)
            return { errors: { _form: ['Failed to create category. Database error.'] } }
        }

        // 4. Log audit
        await logAudit({
            action: 'category.create',
            targetId: data.id,
            details: {
                after: { name, slug, icon, is_featured, sort_order }
            }
        })
    } catch (e) {
        return { errors: { _form: ['Unexpected error occurred'] } }
    }

    revalidatePath('/admin/categories')
    redirect('/admin/categories')
}

export async function updateCategory(id: string, prevState: CategoryState, formData: FormData): Promise<CategoryState> {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const icon = formData.get('icon') as string
    const is_featured = formData.get('is_featured') === 'true'
    const sort_order = parseInt(formData.get('sort_order') as string) || 0

    // Basic validation
    if (!name || name.length < 3) {
        return { errors: { name: ['Name must be at least 3 characters'] } }
    }
    if (!slug) {
        return { errors: { slug: ['Slug is required'] } }
    }

    const supabase = await createClient()

    try {
        // 1. Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { errors: { _form: ['Not authenticated'] } }
        }

        // 2. Check Super Admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            return { errors: { _form: ['Access denied. Only Super Admin can manage categories.'] } }
        }

        // 3. Fetch old data first for audit comparison
        const { data: oldCategory } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single()

        // 4. Update category
        const { error } = await supabase
            .from('categories')
            .update({ name, slug, icon, is_featured, sort_order })
            .eq('id', id)

        if (error) {
            console.error('Update category error:', error)
            return { errors: { _form: ['Failed to update category.'] } }
        }

        // 5. Log audit with changes
        if (oldCategory) {
            const changes = generateChangesSummary(
                oldCategory,
                { name, slug, icon, is_featured, sort_order }
            )

            await logAudit({
                action: 'category.update',
                targetId: id,
                details: {
                    before: oldCategory,
                    after: { name, slug, icon, is_featured, sort_order },
                    changes
                }
            })
        }
    } catch (e) {
        return { errors: { _form: ['Unexpected error occurred'] } }
    }

    revalidatePath('/admin/categories')
    redirect('/admin/categories')
}

export async function deleteCategory(formData: FormData) {
    const id = formData.get('id')
    if (!id) return

    const supabase = await createClient()

    try {
        // 1. Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('Delete category error: Not authenticated')
            return
        }

        // 2. Check Super Admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            console.error('Delete category error: Access denied')
            return
        }

        // 3. Fetch category before deletion for audit log
        const { data: categoryToDelete } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single()

        // 4. Delete category
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error

        // 5. Log deletion
        if (categoryToDelete) {
            await logAudit({
                action: 'category.delete',
                targetId: id as string,
                details: {
                    before: categoryToDelete,
                    metadata: { deletedAt: new Date().toISOString() }
                }
            })
        }

        revalidatePath('/admin/categories')
    } catch (error) {
        console.error('Delete category error:', error)
    }
}
