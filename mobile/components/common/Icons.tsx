// Centralized Icon System - Lucide React Native
// Use these icons consistently across the app instead of emoji

import {
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
  Globe,
  Zap,
  Gift,
  Award,
  Coffee,
} from "lucide-react-native";

export const icons = {
  // Navigation & Actions
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

  // Food & Restaurant
  Utensils,
  Coffee,

  // Navigation
  ArrowRight,
  ArrowLeft,

  // Order & Delivery
  Package,
  Truck,

  // Payment
  CreditCard,
  Wallet,

  // Location & Home
  Home,
  Globe,

  // Support
  MessageSquare,
  Headphones,

  // Misc
  ExternalLink,
  StarHalf,
  Timer,
  Tag,
  Percent,
  Shield,
  Gift,
  Award,
  Zap,
};

export type IconName = keyof typeof icons;
export { icons as LucideIcons };