import {
  ShoppingBag,
  Utensils,
  Hotel,
  Hospital,
  Briefcase,
  Home,
  Car,
  GraduationCap,
  Scissors,
  Monitor,
  Dumbbell,
  Bus,
} from 'lucide-react';
import type { BusinessCategory, MoodOption, RecentAd, FAQ } from '@/types';

export const RECENT_ADS: RecentAd[] = [
  {
    id: 'ad1',
    title: 'Gourmet Delights',
    category: 'Food',
    videoUrl: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/q_auto:good,f_auto/opentry_ads_video_2.mp4',
    thumbnail: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/so_8.4,q_auto,f_png/opentry_ads_video_2.png'
  },
  {
    id: 'ad2',
    title: 'Travel Dreams',
    category: 'Travel',
    videoUrl: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/q_auto:good,f_auto/opentry_ads_video_1.mp4',
    thumbnail: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/so_16,q_auto,f_png/opentry_ads_video_3.png'
  },
  {
    id: 'ad3',
    title: 'Premium Products',
    category: 'Product',
    videoUrl: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/q_auto:good,f_auto/opentry_ads_video_3.mp4',
    thumbnail: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/so_20,q_auto,f_png/opentry_ads_video_3.png'
  }
];

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: 'product', label: 'Retail', icon: ShoppingBag, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_1.jpg' },
  { id: 'food', label: 'Restro', icon: Utensils, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_2.jpg' },
  { id: 'hospitality', label: 'Hotel', icon: Hotel, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_3.jpg' },
  { id: 'medical', label: 'Medical', icon: Hospital, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_4.jpg' },
  { id: 'service', label: 'Services', icon: Briefcase, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_6.jpg' },
  { id: 'real_estate', label: 'Property', icon: Home, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_7.jpg' },
  { id: 'automotive', label: 'Auto', icon: Car, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_8.jpg' },
  { id: 'education', label: 'Education', icon: GraduationCap, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_9.jpg' },
  { id: 'beauty', label: 'Beauty', icon: Scissors, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_10.jpg' },
  { id: 'tech', label: 'Tech', icon: Monitor, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_11.jpg' },
  { id: 'gym', label: 'Gym', icon: Dumbbell, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_12.jpg' },
  { id: 'travel', label: 'Travel', icon: Bus, bgImage: 'https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767980480/opentry_ai_ads_13.jpg' },
];

export const MOODS: MoodOption[] = [
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'high_energy', label: 'High Energy' },
  { id: 'minimalist', label: 'Simple' },
  { id: 'emotional', label: 'Story-driven' },
  { id: 'corporate', label: 'Professional' },
];

export const FAQS: FAQ[] = [
  {
    q: "How accurate are the generated visuals?",
    a: "We use the latest AI models to ensure high-fidelity, commercially viable visuals that match your brand's unique DNA and style."
  },
  {
    q: "Is the music and voiceover copyright-free?",
    a: "Yes, all music and audio narration generated within Opentry are licensed for commercial use across all major social media platforms."
  },
  {
    q: "What is the actual cost per ad generation?",
    a: "Our optimized pipeline is designed for extreme cost efficiency. You pay approximately ₹12-₹15 per professional 20-second commercial."
  },
  {
    q: "Can I use my own brand logo and assets?",
    a: "Absolutely. You can upload your logo and up to 10 product photos. Our AI analyzes these to ensure your brand's identity is maintained throughout the video."
  }
];
