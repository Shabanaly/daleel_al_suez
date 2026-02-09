import {
    Utensils,
    Stethoscope,
    ShoppingBag,
    Briefcase,
    Wrench,
    Car,
    GraduationCap,
    Landmark,
    Dumbbell,
    Music,
    Palette,
    Plane,
    Home,
    Wifi,
    Tv,
    Coffee,
    Pizza,
    Scissors,
    Shirt,
    Laptop,
    Folder,
    LucideIcon
} from 'lucide-react'

// Map of icon names (lowercase) to Lucide components
const iconMap: Record<string, LucideIcon> = {
    'utensils': Utensils,
    'restaurant': Utensils,
    'food': Utensils,
    'stethoscope': Stethoscope,
    'doctor': Stethoscope,
    'health': Stethoscope,
    'medical': Stethoscope,
    'shopping-bag': ShoppingBag,
    'shopping': ShoppingBag,
    'shop': ShoppingBag,
    'briefcase': Briefcase,
    'work': Briefcase,
    'wrench': Wrench,
    'service': Wrench,
    'repair': Wrench,
    'car': Car,
    'auto': Car,
    'graduation-cap': GraduationCap,
    'education': GraduationCap,
    'school': GraduationCap,
    'landmark': Landmark,
    'bank': Landmark,
    'government': Landmark,
    'dumbbell': Dumbbell,
    'gym': Dumbbell,
    'fitness': Dumbbell,
    'music': Music,
    'entertainment': Music,
    'palette': Palette,
    'art': Palette,
    'design': Palette,
    'plane': Plane,
    'travel': Plane,
    'home': Home,
    'real-estate': Home,
    'wifi': Wifi,
    'internet': Wifi,
    'tv': Tv,
    'electronics': Tv,
    'coffee': Coffee,
    'cafe': Coffee,
    'pizza': Pizza,
    'fast-food': Pizza,
    'scissors': Scissors,
    'salon': Scissors,
    'barber': Scissors,
    'shirt': Shirt,
    'clothing': Shirt,
    'fashion': Shirt,
    'laptop': Laptop,
    'tech': Laptop,
    'computer': Laptop
}

interface CategoryIconProps {
    name?: string;
    size?: number;
    className?: string;
}

export function CategoryIcon({ name, size = 24, className }: CategoryIconProps) {
    if (!name) return <Folder size={size} className={className} />;

    const normalizedName = name.toLowerCase().trim();
    const IconComponent = iconMap[normalizedName] || Folder;

    return <IconComponent size={size} className={className} />;
}
