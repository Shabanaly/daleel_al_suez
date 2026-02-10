export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
    fullName: string;
    avatarUrl?: string;
    createdAt?: string;
}
