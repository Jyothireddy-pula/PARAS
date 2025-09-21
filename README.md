# PARAS - Smart Parking Management System

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://paras-v1.netlify.app)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-cyan)](https://tailwindcss.com/)

A modern, full-stack parking management solution with real-time availability tracking, AI-powered analytics, beautiful UI animations, and integrated mapping. Built with React, Vite, and enhanced with Aceternity UI components.

## ✨ Features

### 🎨 **Modern UI & Animations**
- **Aceternity UI Components**: Beautiful animated components with Framer Motion
- **Responsive Design**: Optimized for desktop and mobile devices
- **Interactive Animations**: Smooth transitions and micro-interactions
- **Glassmorphism Effects**: Modern glass-like UI elements
- **Gradient Backgrounds**: Beautiful color schemes throughout

### 🗺️ **Smart Mapping & Navigation**
- **Interactive Maps**: Google Maps integration with custom markers
- **Real-time Directions**: Automatic route calculation and display
- **Mobile-Optimized**: Touch-friendly map interactions
- **Auto-Nearest Parking**: Automatically finds and shows nearest parking
- **Visual Route Display**: Blue polylines showing the path to parking

### 🚗 **Parking Management**
- **Real-time Availability**: Live parking spot tracking
- **Smart Search**: Location-based parking discovery
- **Booking System**: Easy reservation and management
- **Price Tracking**: Dynamic pricing information
- **Distance Calculation**: Automatic distance and duration estimates

### 🤖 **AI & Analytics**
- **AI-Generated Reports**: Smart congestion analysis
- **Admin Dashboard**: Comprehensive booking analytics
- **PDF Generation**: Automated report creation
- **Data Visualization**: Charts and graphs for insights

### 📱 **Mobile Experience**
- **Full-Screen Maps**: Uninterrupted map viewing
- **Touch Interactions**: Optimized for mobile devices
- **Direct Booking**: Tap parking spots to book instantly
- **Responsive UI**: Adapts to all screen sizes

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Maps API key
- Supabase account

### Step 1: Clone the Repository
```bash
git clone https://github.com/tanmayrajurkar/PARAS.git
cd PARAS
```

### Step 2: Install Dependencies
**Important**: Use the `--legacy-peer-deps` flag due to some older dependencies:

```bash
npm install --legacy-peer-deps
```

**Alternative with yarn:**
```bash
yarn install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AI Integration
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

### Step 4: Database Setup
1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/`
3. Set up the required tables and functions

### Step 5: Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Opens the app at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

## 🛠️ Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Frontend** | React | 18.3.1 | UI Framework |
| **Build Tool** | Vite | 5.4.11 | Fast development & building |
| **Styling** | Tailwind CSS | 3.4.11 | Utility-first CSS |
| **Animations** | Framer Motion | Latest | Smooth animations |
| **UI Components** | Aceternity UI | Custom | Beautiful animated components |
| **State Management** | Redux Toolkit | 1.9.5 | Global state management |
| **Maps** | Google Maps API | Latest | Interactive mapping |
| **Database** | Supabase | 2.46.1 | PostgreSQL database |
| **AI** | Google Gemini | 0.21.0 | AI-powered analytics |
| **HTTP Client** | Axios | 1.4.0 | API requests |
| **Routing** | React Router | 6.14.2 | Client-side routing |

## 📂 Project Structure

```
PARAS/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Aceternity UI components
│   │   ├── bookings/      # Booking-related components
│   │   ├── mapBookings/   # Map and location components
│   │   └── ...           # Other component categories
│   ├── features/          # Redux slices and state management
│   ├── pages/             # Application routes and pages
│   ├── services/          # API services and external integrations
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── assets/            # Images, icons, and static files
│   └── lib/               # Library configurations
├── supabase/              # Database migrations and functions
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🎨 UI Components

### Aceternity UI Integration
- **AnimatedText**: Typewriter effect with blinking cursor
- **AnimatedCard**: Cards with hover effects and gradient overlays
- **GlareCard**: Interactive cards with glare effects
- **ShimmerButton**: Buttons with shimmer animations
- **FloatingElements**: Background floating particles
- **AnimatedLoader**: Beautiful loading spinners

### Custom Components
- **MobileMap**: Touch-optimized map component
- **ParkCard**: Enhanced parking spot cards
- **AnimatedHeader**: Animated section headers
- **InfoWindow**: Mobile-optimized information displays

## 🔧 Configuration

### Environment Variables
All environment variables are prefixed with `VITE_` for Vite compatibility:

```env
# Database
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AI
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

### Google Maps Setup
1. Enable the following APIs in Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API

### Supabase Setup
1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/`
3. Enable Row Level Security (RLS)
4. Set up authentication policies

## 🐛 Troubleshooting

### Common Issues

**1. Dependency Conflicts**
```bash
# If you encounter peer dependency issues
npm install --legacy-peer-deps
```

**2. Google Maps Not Loading**
- Verify your API key is correct
- Check if the required APIs are enabled
- Ensure billing is set up for your Google Cloud project

**3. Supabase Connection Issues**
- Verify your project URL and anon key
- Check if RLS policies are properly configured
- Ensure your database tables are created

**4. Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📱 Mobile Optimization

### Features
- **Touch-Friendly**: All interactions optimized for mobile
- **Responsive Design**: Adapts to all screen sizes
- **Full-Screen Maps**: Uninterrupted map viewing
- **Direct Booking**: Tap parking spots to book instantly
- **Auto-Navigation**: Automatic route calculation and display

### Browser Support
- Chrome (Mobile & Desktop)
- Safari (Mobile & Desktop)
- Firefox (Mobile & Desktop)
- Edge (Desktop)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes:
```bash
git commit -m 'Add some amazing feature'
```
4. Push to the branch:
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- [Aceternity UI](https://ui.aceternity.com) for beautiful animated components
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Google Maps API](https://developers.google.com/maps) for mapping functionality
- [Supabase](https://supabase.com) for backend services
- [Tailwind CSS](https://tailwindcss.com) for styling

---

> **Note**: This project requires Google Maps API key and Supabase credentials for full functionality. Make sure to set up all environment variables before running the application.