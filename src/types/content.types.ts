// ==========================================
// CONTENT TYPES — Landing Page
// ==========================================

export interface SiteConfig {
  id: string;
  brand_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  font_url: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string | null;
  updated_at: string;
}

export interface HeroSection {
  id: string;
  headline: string;
  subheadline: string | null;
  cta_text: string;
  image_url: string | null;
  bg_color: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface PromoSection {
  id: string;
  badge_text: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface PricingItem {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  features: string[];
  is_popular: boolean;
  cta_text: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  content: string;
  rating: number;
  testimonial_date: string | null;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  whatsapp_number: string | null;
  email: string | null;
  photo_url: string | null;
  cta_text: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface Expedition {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
}

export interface LandingPageData {
  site_config: SiteConfig | null;
  hero: HeroSection | null;
  promo: PromoSection | null;
  pricing: PricingItem[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  contact_person: ContactPerson | null;
}

export interface HeroSection {
  id: string;
  headline: string;
  subheadline: string | null;
  cta_text: string;
  image_url: string | null;
  bg_color: string | null;
  is_active: boolean;
  // NEW
  secondary_cta_text: string | null;
  secondary_cta_target: string | null;
  updated_at: string;
}
