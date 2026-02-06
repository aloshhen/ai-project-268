/**
 * Icon Registry - Strict whitelist of allowed lucide-react icons
 * This prevents AI hallucinations and ensures only valid icons are used
 */

import {
  // Basic UI
  Home,
  Menu,
  X,
  Search,
  Settings,
  User,
  Users,
  Bell,
  Mail,
  Phone,

  // Navigation
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,

  // Actions
  Check,
  Plus,
  Minus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Copy,
  Share,
  Send,
  Download,
  Upload,

  // Status
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,

  // Social
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Globe,
  Link,
  ExternalLink,

  // Business
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,

  // Files
  File,
  Folder,
  Save,
  Print,
  Bookmark,
  Calendar,
  Clock,
  Tag,
  Flag,

  // Media
  Image,
  Video,
  Camera,
  Music,
  Mic,
  Headphones,
  Volume,
  Play,
  Pause,

  // System
  Lock,
  Unlock,
  Shield,
  Database,
  Server,
  Cloud,
  Wifi,
  Battery,
  Monitor,
  Smartphone,

  // Design
  Sun,
  Moon,
  Star,
  Heart,
  Zap,
  Target,
  Award,
  Trophy,
  Gift,
  Coffee,

  type LucideIcon
} from 'lucide-react';

/**
 * Icon Registry Map - Maps string keys to actual icon components
 * Only these keys are valid for use with SafeIcon component
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // Basic UI
  'home': Home,
  'menu': Menu,
  'x': X,
  'search': Search,
  'settings': Settings,
  'user': User,
  'users': Users,
  'bell': Bell,
  'mail': Mail,
  'phone': Phone,

  // Navigation
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,

  // Actions
  'check': Check,
  'plus': Plus,
  'minus': Minus,
  'edit': Edit,
  'trash': Trash,
  'eye': Eye,
  'eye-off': EyeOff,
  'copy': Copy,
  'share': Share,
  'send': Send,
  'download': Download,
  'upload': Upload,

  // Status
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'info': Info,
  'help-circle': HelpCircle,

  // Social
  'facebook': Facebook,
  'twitter': Twitter,
  'instagram': Instagram,
  'youtube': Youtube,
  'linkedin': Linkedin,
  'github': Github,
  'globe': Globe,
  'link': Link,
  'external-link': ExternalLink,

  // Business
  'shopping-cart': ShoppingCart,
  'credit-card': CreditCard,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'bar-chart': BarChart,
  'pie-chart': PieChart,

  // Files
  'file': File,
  'folder': Folder,
  'save': Save,
  'print': Print,
  'bookmark': Bookmark,
  'calendar': Calendar,
  'clock': Clock,
  'tag': Tag,
  'flag': Flag,

  // Media
  'image': Image,
  'video': Video,
  'camera': Camera,
  'music': Music,
  'mic': Mic,
  'headphones': Headphones,
  'volume': Volume,
  'play': Play,
  'pause': Pause,

  // System
  'lock': Lock,
  'unlock': Unlock,
  'shield': Shield,
  'database': Database,
  'server': Server,
  'cloud': Cloud,
  'wifi': Wifi,
  'battery': Battery,
  'monitor': Monitor,
  'smartphone': Smartphone,

  // Design
  'sun': Sun,
  'moon': Moon,
  'star': Star,
  'heart': Heart,
  'zap': Zap,
  'target': Target,
  'award': Award,
  'trophy': Trophy,
  'gift': Gift,
  'coffee': Coffee,
};

/**
 * Type-safe icon keys - only these strings are valid
 */
export type IconKey = keyof typeof ICON_REGISTRY;

/**
 * Get list of all valid icon keys
 */
export const getValidIconKeys = (): IconKey[] => {
  return Object.keys(ICON_REGISTRY) as IconKey[];
};

/**
 * Check if a string is a valid icon key
 */
export const isValidIconKey = (key: string): key is IconKey => {
  return key in ICON_REGISTRY;
};
