export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    fullName: string;
    avatarUrl?: string;
    createdAt?: string;
}
