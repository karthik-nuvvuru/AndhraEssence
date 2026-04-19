// Reusable Icon component wrapping Lucide icons
import React from "react";
import { icons, LucideIcons } from "./Icons";

interface IconProps {
  name: keyof typeof icons;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = "#FFFFFF" }) => {
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} strokeWidth={2} />;
};

// Export individual icon components for direct use
export const {
  Search,
  MapPin,
  ShoppingCart,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  X,
  Heart,
  Share2,
  Trash2,
  User,
  Mail,
  Lock,
  Phone,
  Settings,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Check,
  AlertCircle,
  Loader2,
  Utensils,
  ArrowRight,
  ArrowLeft,
  Package,
  CreditCard,
  Wallet,
  Truck,
  Home,
  MessageSquare,
  ExternalLink,
  StarHalf,
  Timer,
  Tag,
  Percent,
  Shield,
  Headphones,
  Gift,
  Award,
  Coffee,
} = LucideIcons;