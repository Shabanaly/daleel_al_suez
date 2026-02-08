export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    is_featured?: boolean;
    sort_order?: number;
}
