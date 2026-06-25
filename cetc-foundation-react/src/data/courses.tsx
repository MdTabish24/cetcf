/**
 * CETCF Course Catalog — All 225 Courses (23 Sectors)
 * Auto-generated from CETCF_Course_List.xlsx
 */

import React from 'react';
import { Sparkles, HeartPulse, Monitor, Zap, HardHat, Car, Utensils, Scissors, Sprout, Stethoscope, BookOpen, Camera, MessageCircle, Dumbbell, Wrench, Leaf, Star, Shield, Terminal, Shirt, Briefcase, Baby, Palette, ClipboardList } from 'lucide-react';

export interface Course {
  sno: number;
  name: string;
  sector: string;
  duration: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  slug: string;
  fee: number;
  icon: React.ReactNode;
}

export interface Sector {
  name: string;
  color: string;
  accent: string;
  icon: React.ReactNode;
  count: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const SECTOR_META: Record<string, { color: string; accent: string; icon: React.ReactNode }> = {
  'Beauty & Lifestyle':                          { color: '#C2185B', accent: '#D4A017', icon: <Sparkles size={16} /> },
  'Wellness & Alternative Therapy':              { color: '#00897B', accent: '#D4A017', icon: <HeartPulse size={16} /> },
  'Digital & Information Technology':             { color: '#1565C0', accent: '#00BCD4', icon: <Monitor size={16} /> },
  'Electrical & Electronics Trades':              { color: '#F57F17', accent: '#E64A19', icon: <Zap size={16} /> },
  'Construction & Building Trades':               { color: '#5D4037', accent: '#E65100', icon: <HardHat size={16} /> },
  'Automobile & Motor Trades':                    { color: '#C62828', accent: '#455A64', icon: <Car size={16} /> },
  'Food, Catering & Hospitality':                 { color: '#E65100', accent: '#5D4037', icon: <Utensils size={16} /> },
  'Fashion, Tailoring & Textiles':                { color: '#6A1B9A', accent: '#E91E8C', icon: <Scissors size={16} /> },
  'Agriculture & Rural Livelihood':               { color: '#2E7D32', accent: '#5D4037', icon: <Sprout size={16} /> },
  'Healthcare & Medical Support':                 { color: '#00838F', accent: '#1565C0', icon: <Stethoscope size={16} /> },
  'Education & Early Childhood':                  { color: '#283593', accent: '#D4A017', icon: <BookOpen size={16} /> },
  'Media, Photography & Content Creation':        { color: '#4527A0', accent: '#E91E8C', icon: <Camera size={16} /> },
  'Spoken Languages & Communication':             { color: '#006064', accent: '#00897B', icon: <MessageCircle size={16} /> },
  'Sports, Fitness & Recreation':                 { color: '#B71C1C', accent: '#0D1B3E', icon: <Dumbbell size={16} /> },
  'Plumbing, Sanitation & Water':                 { color: '#37474F', accent: '#00897B', icon: <Wrench size={16} /> },
  'Environmental & Green Skills':                 { color: '#1B5E20', accent: '#4CAF50', icon: <Leaf size={16} /> },
  'Religious & Spiritual Education':              { color: '#BF360C', accent: '#FF6F00', icon: <Star size={16} /> },
  'Security & Facility Management':               { color: '#0D1B3E', accent: '#455A64', icon: <Shield size={16} /> },
  'Advanced Beauty, Cosmetology & Aesthetics':     { color: '#AD1457', accent: '#D4A017', icon: <Sparkles size={16} /> },
  'Advanced IT, Programming & Tech Skills':        { color: '#0D47A1', accent: '#00E676', icon: <Terminal size={16} /> },
  'Apparel Design, Pattern Making & Fashion Technology': { color: '#7B1FA2', accent: '#E91E8C', icon: <Shirt size={16} /> },
  'Business, Retail & Finance':                   { color: '#1565C0', accent: '#D4A017', icon: <Briefcase size={16} /> },
  'Child Care & Domestic Services':                { color: '#E91E63', accent: '#FF8A80', icon: <Baby size={16} /> },
  'Handicrafts & Creative Arts':                   { color: '#795548', accent: '#FF9800', icon: <Palette size={16} /> },
};

function getFee(level: string): number {
  switch (level) {
    case 'Advanced': return 2000;
    case 'Intermediate': return 1500;
    default: return 1000;
  }
}

function getIcon(sector: string): React.ReactNode {
  return SECTOR_META[sector]?.icon || <ClipboardList size={16} />;
}

// Raw course data — auto-generated from CETCF_Course_List.xlsx (225 courses, 23 sectors)
const RAW_COURSES: Array<[number, string, string, string, string]> = [
  [1, 'Beautician & Makeup Artist', 'Beauty & Lifestyle', '3 Months', 'Foundation'],
  [2, 'Hair Styling & Coloring Technician', 'Beauty & Lifestyle', '3 Months', 'Foundation'],
  [3, 'Bridal Makeup Specialist', 'Beauty & Lifestyle', '6 Months', 'Advanced'],
  [4, 'Nail Art & Extension Technician', 'Beauty & Lifestyle', '2 Months', 'Foundation'],
  [5, 'Mehendi / Henna Art Professional', 'Beauty & Lifestyle', '2 Months', 'Foundation'],
  [6, 'Skin Care & Facial Therapist', 'Beauty & Lifestyle', '4 Months', 'Intermediate'],
  [7, 'Eyelash & Eyebrow Technician', 'Beauty & Lifestyle', '2 Months', 'Foundation'],
  [8, 'Pedicure & Manicure Specialist', 'Beauty & Lifestyle', '1 Month', 'Foundation'],
  [9, 'Waxing & Hair Removal Technician', 'Beauty & Lifestyle', '1 Month', 'Foundation'],
  [10, 'Salon Management & Business Skills', 'Beauty & Lifestyle', '3 Months', 'Intermediate'],
  [11, 'Hijama / Wet Cupping Practitioner', 'Wellness & Alternative Therapy', '3 Months', 'Intermediate'],
  [12, 'Foundation Course in Cupping Therapy', 'Wellness & Alternative Therapy', '2 Months', 'Foundation'],
  [13, 'Yoga Instructor Certification', 'Wellness & Alternative Therapy', '3 Months', 'Foundation'],
  [14, 'Meditation & Mindfulness Trainer', 'Wellness & Alternative Therapy', '2 Months', 'Foundation'],
  [15, 'Weight Management & Fitness Advisor', 'Wellness & Alternative Therapy', '2 Months', 'Foundation'],
  [16, 'MS Office & Digital Literacy', 'Digital & Information Technology', '2 Months', 'Foundation'],
  [17, 'Tally Prime & GST Accounting', 'Digital & Information Technology', '3 Months', 'Foundation'],
  [18, 'Digital Marketing Professional', 'Digital & Information Technology', '3 Months', 'Intermediate'],
  [19, 'Social Media Management', 'Digital & Information Technology', '2 Months', 'Foundation'],
  [20, 'Graphic Design – Canva & CorelDRAW', 'Digital & Information Technology', '2 Months', 'Foundation'],
  [21, 'Data Entry Operator (DEO)', 'Digital & Information Technology', '2 Months', 'Foundation'],
  [22, 'Computer Hardware & Networking', 'Digital & Information Technology', '3 Months', 'Foundation'],
  [23, 'E-Commerce & Online Selling', 'Digital & Information Technology', '2 Months', 'Foundation'],
  [24, 'AI Tools for Everyday Use (ChatGPT etc.)', 'Digital & Information Technology', '1 Month', 'Foundation'],
  [25, 'Cybersecurity Awareness Certification', 'Digital & Information Technology', '2 Months', 'Foundation'],
  [26, 'Domestic Electrician Certification', 'Electrical & Electronics Trades', '3 Months', 'Foundation'],
  [27, 'AC & Refrigeration Technician (HVAC)', 'Electrical & Electronics Trades', '3 Months', 'Intermediate'],
  [28, 'Solar Panel Installation Technician', 'Electrical & Electronics Trades', '2 Months', 'Foundation'],
  [29, 'Mobile Phone Repair Technician', 'Electrical & Electronics Trades', '2 Months', 'Foundation'],
  [30, 'CCTV Installation & Maintenance', 'Electrical & Electronics Trades', '2 Months', 'Foundation'],
  [31, 'Laptop & Computer Hardware Repair', 'Electrical & Electronics Trades', '3 Months', 'Foundation'],
  [32, 'LED & Electrical Wiring Technician', 'Electrical & Electronics Trades', '2 Months', 'Foundation'],
  [33, 'Home Appliance Repair Technician', 'Electrical & Electronics Trades', '2 Months', 'Foundation'],
  [34, 'Inverter & Battery System Technician', 'Electrical & Electronics Trades', '1 Month', 'Foundation'],
  [35, 'DTH & Cable TV Technician', 'Electrical & Electronics Trades', '1 Month', 'Foundation'],
  [36, 'Mason & Bricklaying Technician', 'Construction & Building Trades', '2 Months', 'Foundation'],
  [37, 'Tile Fitting & Floor Work Technician', 'Construction & Building Trades', '2 Months', 'Foundation'],
  [38, 'House Painting & Surface Finishing', 'Construction & Building Trades', '1 Month', 'Foundation'],
  [39, 'Carpenter & Wood Work Technician', 'Construction & Building Trades', '3 Months', 'Foundation'],
  [40, 'Plumber Certification', 'Construction & Building Trades', '2 Months', 'Foundation'],
  [41, 'Welding & Fabrication Technician', 'Construction & Building Trades', '3 Months', 'Foundation'],
  [42, 'Interior Decoration & POP Work', 'Construction & Building Trades', '2 Months', 'Foundation'],
  [43, 'Waterproofing & Sealing Technician', 'Construction & Building Trades', '1 Month', 'Foundation'],
  [44, 'Scaffolding & Shuttering Technician', 'Construction & Building Trades', '1 Month', 'Foundation'],
  [45, 'Site Supervisor – Construction', 'Construction & Building Trades', '3 Months', 'Intermediate'],
  [46, 'Two Wheeler Mechanic Certification', 'Automobile & Motor Trades', '3 Months', 'Foundation'],
  [47, 'Four Wheeler (Car) Service Technician', 'Automobile & Motor Trades', '3 Months', 'Foundation'],
  [48, 'Denting & Painting Technician', 'Automobile & Motor Trades', '3 Months', 'Foundation'],
  [49, 'Auto Electrician', 'Automobile & Motor Trades', '2 Months', 'Foundation'],
  [50, 'Tyre & Wheel Alignment Technician', 'Automobile & Motor Trades', '1 Month', 'Foundation'],
  [51, 'EV Battery & Motor Basic Technician', 'Automobile & Motor Trades', '2 Months', 'Foundation'],
  [52, 'Diesel Engine Mechanic', 'Automobile & Motor Trades', '3 Months', 'Foundation'],
  [53, 'Vehicle Body Repair & Restoration', 'Automobile & Motor Trades', '2 Months', 'Foundation'],
  [54, 'CNG/LPG Kit Installation Technician', 'Automobile & Motor Trades', '1 Month', 'Foundation'],
  [55, 'Heavy Vehicle Driver Assistant', 'Automobile & Motor Trades', '2 Months', 'Foundation'],
  [56, 'Professional Cooking & Kitchen Management', 'Food, Catering & Hospitality', '3 Months', 'Foundation'],
  [57, 'Bakery & Confectionery Certificate', 'Food, Catering & Hospitality', '3 Months', 'Foundation'],
  [58, 'Fast Food & Street Food Business', 'Food, Catering & Hospitality', '1 Month', 'Foundation'],
  [59, 'Catering & Event Food Management', 'Food, Catering & Hospitality', '2 Months', 'Foundation'],
  [60, 'Mughlai & North Indian Cuisine', 'Food, Catering & Hospitality', '2 Months', 'Foundation'],
  [61, 'South Indian & Regional Cuisine', 'Food, Catering & Hospitality', '2 Months', 'Foundation'],
  [62, 'Chinese & Continental Cooking', 'Food, Catering & Hospitality', '2 Months', 'Foundation'],
  [63, 'Cake Decoration & Fondant Art', 'Food, Catering & Hospitality', '2 Months', 'Foundation'],
  [64, 'Food Safety & Hygiene (FSSAI Basics)', 'Food, Catering & Hospitality', '1 Month', 'Foundation'],
  [65, 'Juice Bar & Smoothie Business Setup', 'Food, Catering & Hospitality', '1 Month', 'Foundation'],
  [66, 'Hand Embroidery – Zari, Aari & Chikankari', 'Fashion, Tailoring & Textiles', '3 Months', 'Foundation'],
  [67, 'Machine Embroidery & Computerised Design', 'Fashion, Tailoring & Textiles', '3 Months', 'Intermediate'],
  [68, 'Basic Tailoring & Garment Construction', 'Fashion, Tailoring & Textiles', '3 Months', 'Foundation'],
  [69, 'Advanced Ladies Tailoring', 'Fashion, Tailoring & Textiles', '4 Months', 'Intermediate'],
  [70, 'Gents Tailoring & Shirt–Trouser Making', 'Fashion, Tailoring & Textiles', '3 Months', 'Foundation'],
  [71, 'Saree Draping & Styling', 'Fashion, Tailoring & Textiles', '1 Month', 'Foundation'],
  [72, 'Block Printing & Textile Dyeing', 'Fashion, Tailoring & Textiles', '2 Months', 'Foundation'],
  [73, 'Knitting & Crochet Work', 'Fashion, Tailoring & Textiles', '2 Months', 'Foundation'],
  [74, 'Jute & Bamboo Craft Certification', 'Fashion, Tailoring & Textiles', '2 Months', 'Foundation'],
  [75, 'Bag & Accessory Making', 'Fashion, Tailoring & Textiles', '2 Months', 'Foundation'],
  [76, 'Organic Farming & Vermicomposting', 'Agriculture & Rural Livelihood', '2 Months', 'Foundation'],
  [77, 'Mushroom Cultivation Certification', 'Agriculture & Rural Livelihood', '1 Month', 'Foundation'],
  [78, 'Dairy Farming & Milk Processing', 'Agriculture & Rural Livelihood', '2 Months', 'Foundation'],
  [79, 'Poultry Farming & Hatchery Management', 'Agriculture & Rural Livelihood', '2 Months', 'Foundation'],
  [80, 'Goat & Sheep Rearing', 'Agriculture & Rural Livelihood', '1 Month', 'Foundation'],
  [81, 'Beekeeping & Honey Production', 'Agriculture & Rural Livelihood', '1 Month', 'Foundation'],
  [82, 'Fish Farming (Pisciculture)', 'Agriculture & Rural Livelihood', '2 Months', 'Foundation'],
  [83, 'Gardening & Landscaping Technician', 'Agriculture & Rural Livelihood', '2 Months', 'Foundation'],
  [84, 'Tractor Operation & Maintenance', 'Agriculture & Rural Livelihood', '1 Month', 'Foundation'],
  [85, 'Post-Harvest Storage & Processing', 'Agriculture & Rural Livelihood', '1 Month', 'Foundation'],
  [86, 'Child Care Worker / Nanny Training', 'Child Care & Domestic Services', '3 Months', 'Foundation'],
  [87, 'Elderly Care & Geriatric Support', 'Child Care & Domestic Services', '3 Months', 'Foundation'],
  [88, 'Housekeeping & Cleaning Technician', 'Child Care & Domestic Services', '1 Month', 'Foundation'],
  [89, 'Laundry & Dry Cleaning Technician', 'Child Care & Domestic Services', '1 Month', 'Foundation'],
  [90, 'Cook / Chef – Home-Based Services', 'Child Care & Domestic Services', '2 Months', 'Foundation'],
  [91, 'Patient Care Assistant / Home Nurse', 'Child Care & Domestic Services', '3 Months', 'Foundation'],
  [92, 'Domestic Helper – Multi-Skill Training', 'Child Care & Domestic Services', '1 Month', 'Foundation'],
  [93, 'Nutrition & Meal Planning Basics', 'Child Care & Domestic Services', '1 Month', 'Foundation'],
  [94, 'Pet Grooming & Basic Pet Care', 'Child Care & Domestic Services', '1 Month', 'Foundation'],
  [95, 'Baby Massage & Infant First Aid', 'Child Care & Domestic Services', '1 Month', 'Foundation'],
  [96, 'Pre-Primary Teacher Training (PRT)', 'Education & Early Childhood', '3 Months', 'Foundation'],
  [97, 'Montessori Teaching Certificate', 'Education & Early Childhood', '3 Months', 'Foundation'],
  [98, 'Special Education Assistant', 'Education & Early Childhood', '3 Months', 'Foundation'],
  [99, 'Tuition & Home Tutoring Skills', 'Education & Early Childhood', '2 Months', 'Foundation'],
  [100, 'Spoken English Teaching Methodology', 'Education & Early Childhood', '2 Months', 'Foundation'],
  [101, 'Child Psychology & Counselling Basics', 'Education & Early Childhood', '2 Months', 'Foundation'],
  [102, 'Art & Craft Teaching for Kids', 'Education & Early Childhood', '2 Months', 'Foundation'],
  [103, 'Library Management Basics', 'Education & Early Childhood', '1 Month', 'Foundation'],
  [104, 'School Administration & Office Management', 'Education & Early Childhood', '2 Months', 'Foundation'],
  [105, 'Handwriting Improvement Trainer', 'Education & Early Childhood', '1 Month', 'Foundation'],
  [106, 'Photography – Basic to Professional', 'Media, Photography & Content Creation', '3 Months', 'Foundation'],
  [107, 'Video Editing & Post-Production', 'Media, Photography & Content Creation', '3 Months', 'Intermediate'],
  [108, 'YouTube Content Creation', 'Media, Photography & Content Creation', '2 Months', 'Foundation'],
  [109, 'Event Photography & Videography', 'Media, Photography & Content Creation', '3 Months', 'Intermediate'],
  [110, 'Drone Photography & Aerial Video', 'Media, Photography & Content Creation', '2 Months', 'Foundation'],
  [111, 'Studio Lighting & Product Photography', 'Media, Photography & Content Creation', '2 Months', 'Foundation'],
  [112, 'Sound Engineering & Recording Basics', 'Media, Photography & Content Creation', '3 Months', 'Foundation'],
  [113, 'Radio Jockey (RJ) & Voice-Over Training', 'Media, Photography & Content Creation', '2 Months', 'Foundation'],
  [114, 'Short Film & Documentary Making', 'Media, Photography & Content Creation', '3 Months', 'Intermediate'],
  [115, 'Motion Graphics & Animation Basics', 'Media, Photography & Content Creation', '3 Months', 'Intermediate'],
  [116, 'Spoken English – Beginner Level', 'Spoken Languages & Communication', '2 Months', 'Foundation'],
  [117, 'Spoken English – Intermediate Level', 'Spoken Languages & Communication', '2 Months', 'Intermediate'],
  [118, 'Spoken Arabic – Beginner Level', 'Spoken Languages & Communication', '2 Months', 'Foundation'],
  [119, 'Spoken Arabic – Intermediate Level', 'Spoken Languages & Communication', '3 Months', 'Intermediate'],
  [120, 'Spoken French – Beginner Level', 'Spoken Languages & Communication', '3 Months', 'Foundation'],
  [121, 'Spoken German – Beginner Level', 'Spoken Languages & Communication', '3 Months', 'Foundation'],
  [122, 'Spoken Japanese – Beginner Level', 'Spoken Languages & Communication', '3 Months', 'Foundation'],
  [123, 'Spoken Korean – Beginner Level', 'Spoken Languages & Communication', '3 Months', 'Foundation'],
  [124, 'Urdu Reading, Writing & Conversation', 'Spoken Languages & Communication', '2 Months', 'Foundation'],
  [125, 'Hindi Typing & Official Noting-Drafting', 'Spoken Languages & Communication', '2 Months', 'Foundation'],
  [126, 'Accounting & Bookkeeping Basics', 'Business, Retail & Finance', '3 Months', 'Foundation'],
  [127, 'GST Filing & Tax Assistant', 'Business, Retail & Finance', '2 Months', 'Foundation'],
  [128, 'Retail Store Management', 'Business, Retail & Finance', '2 Months', 'Foundation'],
  [129, 'Billing & Point-of-Sale Operator', 'Business, Retail & Finance', '1 Month', 'Foundation'],
  [130, 'Insurance Agent Training', 'Business, Retail & Finance', '2 Months', 'Foundation'],
  [131, 'Microfinance & SHG Management', 'Business, Retail & Finance', '2 Months', 'Foundation'],
  [132, 'Customer Service Excellence', 'Business, Retail & Finance', '1 Month', 'Foundation'],
  [133, 'Logistics & Warehouse Operations', 'Business, Retail & Finance', '2 Months', 'Foundation'],
  [134, 'Personal Finance & Investment Basics', 'Business, Retail & Finance', '1 Month', 'Foundation'],
  [135, 'Entrepreneurship & Startup Skills', 'Business, Retail & Finance', '3 Months', 'Intermediate'],
  [136, 'Personal Fitness Trainer Certification', 'Sports, Fitness & Recreation', '3 Months', 'Foundation'],
  [137, 'Zumba & Aerobics Instructor', 'Sports, Fitness & Recreation', '2 Months', 'Foundation'],
  [138, 'Yoga Teacher – Foundation Level', 'Sports, Fitness & Recreation', '3 Months', 'Foundation'],
  [139, 'Cricket Coaching Foundation', 'Sports, Fitness & Recreation', '3 Months', 'Foundation'],
  [140, 'Gym Floor Manager', 'Sports, Fitness & Recreation', '2 Months', 'Foundation'],
  [141, 'Swimming Pool Instructor', 'Sports, Fitness & Recreation', '2 Months', 'Foundation'],
  [142, 'Martial Arts – Self Defence Trainer', 'Sports, Fitness & Recreation', '3 Months', 'Foundation'],
  [143, 'Sports Nutrition & Diet Basics', 'Sports, Fitness & Recreation', '1 Month', 'Foundation'],
  [144, 'Kabaddi & Indigenous Sports Coaching', 'Sports, Fitness & Recreation', '2 Months', 'Foundation'],
  [145, 'Children Sports Activity Coordinator', 'Sports, Fitness & Recreation', '2 Months', 'Foundation'],
  [146, 'Pottery & Ceramic Art', 'Handicrafts & Creative Arts', '2 Months', 'Foundation'],
  [147, 'Candle & Soap Making', 'Handicrafts & Creative Arts', '1 Month', 'Foundation'],
  [148, 'Flower Arrangement & Bouquet Making', 'Handicrafts & Creative Arts', '1 Month', 'Foundation'],
  [149, 'Jewellery Making – Artificial & Beaded', 'Handicrafts & Creative Arts', '2 Months', 'Foundation'],
  [150, 'Terracotta & Clay Modelling', 'Handicrafts & Creative Arts', '2 Months', 'Foundation'],
  [151, 'Paper Craft & Origami Art', 'Handicrafts & Creative Arts', '1 Month', 'Foundation'],
  [152, 'Resin Art & Epoxy Craft', 'Handicrafts & Creative Arts', '1 Month', 'Foundation'],
  [153, 'Calligraphy & Hand Lettering', 'Handicrafts & Creative Arts', '2 Months', 'Foundation'],
  [154, 'Wooden Toy & Lacquer Craft', 'Handicrafts & Creative Arts', '2 Months', 'Foundation'],
  [155, 'Traditional Rangoli & Floor Art', 'Handicrafts & Creative Arts', '1 Month', 'Foundation'],
  [156, 'Domestic Plumbing Certification', 'Plumbing, Sanitation & Water', '2 Months', 'Foundation'],
  [157, 'Commercial Plumbing – Buildings & Malls', 'Plumbing, Sanitation & Water', '3 Months', 'Intermediate'],
  [158, 'RO Water Purifier Technician', 'Plumbing, Sanitation & Water', '1 Month', 'Foundation'],
  [159, 'Water Tank Cleaning Technician', 'Plumbing, Sanitation & Water', '1 Month', 'Foundation'],
  [160, 'Sanitation Worker Certification', 'Plumbing, Sanitation & Water', '1 Month', 'Foundation'],
  [161, 'Borewell & Submersible Pump Operator', 'Plumbing, Sanitation & Water', '1 Month', 'Foundation'],
  [162, 'Swimming Pool Maintenance Technician', 'Plumbing, Sanitation & Water', '1 Month', 'Foundation'],
  [163, 'Drainage & Sewage Line Maintenance', 'Plumbing, Sanitation & Water', '1 Month', 'Foundation'],
  [164, 'Toilet & Bathroom Renovation Work', 'Plumbing, Sanitation & Water', '2 Months', 'Foundation'],
  [165, 'Pipe Fitting & Valve Maintenance', 'Plumbing, Sanitation & Water', '1 Month', 'Foundation'],
  [166, 'Solar Energy Technician – Basic', 'Environmental & Green Skills', '2 Months', 'Foundation'],
  [167, 'Solid Waste Management Certification', 'Environmental & Green Skills', '1 Month', 'Foundation'],
  [168, 'Plastic Recycling & Upcycling', 'Environmental & Green Skills', '1 Month', 'Foundation'],
  [169, 'Biogas Plant Installation Technician', 'Environmental & Green Skills', '1 Month', 'Foundation'],
  [170, 'Urban Composting Technician', 'Environmental & Green Skills', '1 Month', 'Foundation'],
  [171, 'Green Building Awareness Basics', 'Environmental & Green Skills', '2 Months', 'Foundation'],
  [172, 'Tree Plantation & Nursery Management', 'Environmental & Green Skills', '1 Month', 'Foundation'],
  [173, 'Eco-Friendly Product Making', 'Environmental & Green Skills', '1 Month', 'Foundation'],
  [174, 'Rainwater Harvesting Technician', 'Environmental & Green Skills', '1 Month', 'Foundation'],
  [175, 'Climate Change & SDG Awareness Educator', 'Environmental & Green Skills', '2 Months', 'Foundation'],
  [176, 'Quran Teacher – Tajweed Certification', 'Religious & Spiritual Education', '3 Months', 'Foundation'],
  [177, 'Madrasa Teacher Training Certificate', 'Religious & Spiritual Education', '3 Months', 'Foundation'],
  [178, 'Islamic Finance & Banking Basics', 'Religious & Spiritual Education', '2 Months', 'Foundation'],
  [179, 'Vedic & Sanskrit Teacher Basics', 'Religious & Spiritual Education', '3 Months', 'Foundation'],
  [180, 'Pooja Vidhi & Karmakand Certification', 'Religious & Spiritual Education', '2 Months', 'Foundation'],
  [181, 'Vastu Shastra – Residential Basics', 'Religious & Spiritual Education', '2 Months', 'Foundation'],
  [182, 'Astrology Fundamentals Certification', 'Religious & Spiritual Education', '3 Months', 'Foundation'],
  [183, 'Spiritual Counselling Basics', 'Religious & Spiritual Education', '2 Months', 'Foundation'],
  [184, 'Moral Values & Life Skills Educator', 'Religious & Spiritual Education', '2 Months', 'Foundation'],
  [185, 'Church Ministry Support & Choir Training', 'Religious & Spiritual Education', '2 Months', 'Foundation'],
  [186, 'Security Guard Certification – Unarmed', 'Security & Facility Management', '1 Month', 'Foundation'],
  [187, 'Mall & Retail Security Officer', 'Security & Facility Management', '1 Month', 'Foundation'],
  [188, 'Residential Society Security Guard', 'Security & Facility Management', '1 Month', 'Foundation'],
  [189, 'CCTV Monitoring & Control Room Operator', 'Security & Facility Management', '1 Month', 'Foundation'],
  [190, 'Fire Extinguisher & Evacuation Basics', 'Security & Facility Management', '1 Month', 'Foundation'],
  [191, 'Access Control & Gate Management', 'Security & Facility Management', '1 Month', 'Foundation'],
  [192, 'Facility & Office Housekeeping', 'Security & Facility Management', '1 Month', 'Foundation'],
  [193, 'Event Security Management', 'Security & Facility Management', '2 Months', 'Foundation'],
  [194, 'Parking & Traffic Management', 'Security & Facility Management', '1 Month', 'Foundation'],
  [195, 'Soft Skills for Security Professionals', 'Security & Facility Management', '1 Month', 'Foundation'],
  [196, 'Advanced Skin Analysis & Treatment', 'Advanced Beauty, Cosmetology & Aesthetics', '4 Months', 'Advanced'],
  [197, 'Chemical Peels & Exfoliation Therapist', 'Advanced Beauty, Cosmetology & Aesthetics', '3 Months', 'Intermediate'],
  [198, 'Microdermabrasion & Skin Polishing', 'Advanced Beauty, Cosmetology & Aesthetics', '2 Months', 'Intermediate'],
  [199, 'Permanent Makeup (Microblading & PMU)', 'Advanced Beauty, Cosmetology & Aesthetics', '3 Months', 'Advanced'],
  [200, 'Laser Hair Removal – Awareness & Assist', 'Advanced Beauty, Cosmetology & Aesthetics', '2 Months', 'Intermediate'],
  [201, 'Hair Extension & Bonding Technician', 'Advanced Beauty, Cosmetology & Aesthetics', '2 Months', 'Intermediate'],
  [202, 'Keratin & Hair Smoothing Treatment', 'Advanced Beauty, Cosmetology & Aesthetics', '1 Month', 'Foundation'],
  [203, 'HD Makeup & Airbrush Technique', 'Advanced Beauty, Cosmetology & Aesthetics', '3 Months', 'Advanced'],
  [204, 'Nail Gel & Acrylic Extension Specialist', 'Advanced Beauty, Cosmetology & Aesthetics', '2 Months', 'Intermediate'],
  [205, 'Beauty Salon Business & Entrepreneur', 'Advanced Beauty, Cosmetology & Aesthetics', '3 Months', 'Intermediate'],
  [206, 'Python Programming – Beginner to Job Ready', 'Advanced IT, Programming & Tech Skills', '4 Months', 'Intermediate'],
  [207, 'Web Development – Full Stack Basics', 'Advanced IT, Programming & Tech Skills', '4 Months', 'Intermediate'],
  [208, 'Database Management – MySQL & SQL Basics', 'Advanced IT, Programming & Tech Skills', '2 Months', 'Foundation'],
  [209, 'Cloud Computing Basics – AWS / Azure', 'Advanced IT, Programming & Tech Skills', '3 Months', 'Intermediate'],
  [210, 'Mobile App Development – Android Basics', 'Advanced IT, Programming & Tech Skills', '4 Months', 'Intermediate'],
  [211, 'Network Administration & IT Support', 'Advanced IT, Programming & Tech Skills', '3 Months', 'Intermediate'],
  [212, 'UI/UX Design – Figma & Prototyping', 'Advanced IT, Programming & Tech Skills', '3 Months', 'Intermediate'],
  [213, 'Data Analytics & Excel Advanced', 'Advanced IT, Programming & Tech Skills', '2 Months', 'Foundation'],
  [214, 'Ethical Hacking & Cyber Awareness', 'Advanced IT, Programming & Tech Skills', '3 Months', 'Intermediate'],
  [215, 'AI & Machine Learning Fundamentals', 'Advanced IT, Programming & Tech Skills', '4 Months', 'Advanced'],
  [216, 'Fashion Design – Foundation Certificate', 'Apparel Design, Pattern Making & Fashion Technology', '3 Months', 'Foundation'],
  [217, 'Apparel Pattern Making – Basic to Advanced', 'Apparel Design, Pattern Making & Fashion Technology', '4 Months', 'Intermediate'],
  [218, 'Garment Construction & Stitching Techniques', 'Apparel Design, Pattern Making & Fashion Technology', '3 Months', 'Foundation'],
  [219, 'Fashion Illustration & Sketching', 'Apparel Design, Pattern Making & Fashion Technology', '2 Months', 'Foundation'],
  [220, 'Draping on Dress Form – Couture Techniques', 'Apparel Design, Pattern Making & Fashion Technology', '3 Months', 'Intermediate'],
  [221, 'Textile Science & Fabric Technology', 'Apparel Design, Pattern Making & Fashion Technology', '2 Months', 'Foundation'],
  [222, 'Knitwear Design & Merchandising', 'Apparel Design, Pattern Making & Fashion Technology', '3 Months', 'Intermediate'],
  [223, 'Garment Export & Merchandising Basics', 'Apparel Design, Pattern Making & Fashion Technology', '3 Months', 'Intermediate'],
  [224, 'CAD for Fashion – Digital Pattern Making', 'Apparel Design, Pattern Making & Fashion Technology', '3 Months', 'Intermediate'],
  [225, 'Fashion Styling & Personal Shopping', 'Apparel Design, Pattern Making & Fashion Technology', '2 Months', 'Foundation'],
];

// Build courses with slugs and fees
export const COURSES: Course[] = RAW_COURSES.map(([sno, name, sector, duration, level]) => ({
  sno,
  name,
  sector,
  duration,
  level: level as Course['level'],
  slug: slugify(name),
  fee: getFee(level),
  icon: getIcon(sector),
}));

// Build sectors summary
export const SECTORS: Sector[] = Object.entries(
  COURSES.reduce((acc, c) => {
    if (!acc[c.sector]) acc[c.sector] = 0;
    acc[c.sector]++;
    return acc;
  }, {} as Record<string, number>)
).map(([name, count]) => ({
  name,
  color: SECTOR_META[name]?.color || '#0D1B3E',
  accent: SECTOR_META[name]?.accent || '#D4A017',
  icon: SECTOR_META[name]?.icon || <ClipboardList size={16} />,
  count,
})).sort((a, b) => b.count - a.count);

// Helper to get course by slug
export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find(c => c.slug === slug);
}

// Helper to get courses by sector
export function getCoursesBySector(sector: string): Course[] {
  return COURSES.filter(c => c.sector === sector);
}

// Helper to search courses
export function searchCourses(query: string): Course[] {
  const q = query.toLowerCase();
  return COURSES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.sector.toLowerCase().includes(q)
  );
}
