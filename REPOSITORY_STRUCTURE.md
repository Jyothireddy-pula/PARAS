# PARAS - Repository Structure

## 📋 Project Overview

**PARAS** is a full-stack parking management solution built with React and Supabase. It provides real-time parking availability tracking, AI-powered analytics, interactive mapping, and comprehensive booking management.

- **Project Name**: park-plus
- **Version**: 0.0.0
- **Type**: React SPA (Single Page Application)
- **Build Tool**: Vite
- **Live Demo**: [paras-v1.netlify.app](https://paras-v1.netlify.app)

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | React 18 + Vite |
| **State Management** | Redux Toolkit |
| **Routing** | React Router DOM v6 |
| **Styling** | Tailwind CSS |
| **Maps Integration** | Google Maps JavaScript API |
| **Database** | Supabase (PostgreSQL) |
| **AI Integration** | Google Gemini |
| **Authentication** | Supabase Auth |
| **UI Components** | Custom + Framer Motion |
| **Charts** | Recharts |
| **PDF Generation** | html2pdf.js |
| **Internationalization** | i18next |

## 📁 Directory Structure

```
PARAS/
├── 📄 Configuration Files
│   ├── package.json                    # Dependencies and scripts
│   ├── package-lock.json              # Lock file for dependencies
│   ├── vite.config.js                 # Vite build configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── eslint.config.js               # ESLint configuration
│   └── index.html                     # Main HTML entry point
│
├── 📁 public/                         # Static assets
│   └── vite.svg                       # Vite logo
│
├── 📁 pages/api/                      # API endpoints
│   └── search-bookings.js             # Booking search API
│
├── 📁 supabase/                       # Database migrations
│   └── migrations/
│       └── create_congestion_function.sql  # Congestion analysis function
│
├── 📁 node_modules/                   # Dependencies (auto-generated)
│
└── 📁 src/                           # Source code
    ├── 📄 main.jsx                    # Application entry point
    ├── 📄 App.jsx                     # Main app component with routing
    ├── 📄 store.js                    # Redux store configuration
    ├── 📄 MapProvider.jsx             # Google Maps context provider
    ├── 📄 index.css                   # Global styles
    ├── 📄 style.js                    # Style utilities
    │
    ├── 📁 lib/                        # External service configurations
    │   └── supabase.js                # Supabase client setup
    │
    ├── 📁 services/                   # API services
    │   ├── supabase.js                # Supabase service functions
    │   └── gemini.js                  # Google Gemini AI service
    │
    ├── 📁 constants/                  # Application constants
    │   └── index.js                   # Global constants
    │
    ├── 📁 utils/                      # Utility functions
    │   ├── index.jsx                  # Utility exports
    │   ├── fetchBookings.js           # Booking data fetching
    │   ├── saveBooking.js             # Booking persistence
    │   ├── handleDriverExit.js        # Driver exit handling
    │   └── slotManagement.js          # Slot management utilities
    │
    ├── 📁 hooks/                      # Custom React hooks
    │   ├── index.js                   # Hook exports
    │   ├── useCheckAvailability.js    # Availability checking
    │   ├── useDistance.js             # Distance calculations
    │   └── availability/
    │       └── useCheckAvailability.js # Advanced availability logic
    │
    ├── 📁 features/                   # Redux slices (state management)
    │   ├── authentication/
    │   │   └── authUserSlice.js       # User authentication state
    │   ├── bookings/
    │   │   ├── bookingsSlice.js       # Booking management state
    │   │   └── parkingSlice.js        # Parking data state
    │   ├── mybookings/
    │   │   └── bookedSlice.js         # User bookings state
    │   └── yourNewSlice.js            # Additional state slice
    │
    ├── 📁 routes/                     # Route protection
    │   └── PrivateRoute.jsx           # Protected route wrapper
    │
    ├── 📁 pages/                      # Application pages/routes
    │   ├── index.js                   # Page exports
    │   ├── HomeLayout.jsx             # Main layout wrapper
    │   ├── Landing.jsx                # Landing page
    │   ├── About.jsx                  # About page
    │   ├── Login.jsx                  # User login
    │   ├── Register.jsx               # User registration
    │   ├── MapBookings.jsx            # Map-based booking interface
    │   ├── ListBookings.jsx           # List view of bookings
    │   ├── SingleBooking.jsx          # Individual booking details
    │   ├── MyBookings.jsx             # User's booking history
    │   ├── Confirmation.jsx           # Booking confirmation
    │   ├── UploadParking.jsx          # Parking upload interface
    │   ├── CommercialParkingForm.jsx  # Commercial parking form
    │   ├── IndividualParkingForm.jsx  # Individual parking form
    │   ├── AdminDashboard.jsx         # Admin management interface
    │   └── ErrorPage.jsx              # Error handling page
    │
    ├── 📁 components/                 # Reusable UI components
    │   ├── index.js                   # Component exports
    │   ├── BookingHistory.jsx         # Booking history display
    │   ├── BookingsDashboard.jsx      # Booking management dashboard
    │   ├── CityWiseBookingInfo.jsx    # City-specific booking info
    │   ├── GovDashboard.jsx           # Government analytics dashboard
    │   ├── ParkingStatistics.jsx     # Parking statistics display
    │   ├── SlotManagement.jsx        # Slot management interface
    │   ├── Map.jsx                    # Basic map component
    │   ├── Map2.jsx                   # Enhanced map component
    │   │
    │   ├── 📁 button/                 # Button components
    │   │   └── Button.jsx             # Reusable button component
    │   │
    │   ├── 📁 inputs/                 # Input components
    │   │   └── InputField.jsx         # Form input component
    │   │
    │   ├── 📁 selectOptions/          # Select/dropdown components
    │   │   ├── Dropdown.jsx           # Dropdown component
    │   │   └── SelectInput.jsx        # Select input component
    │   │
    │   ├── 📁 homeLayout/             # Layout components
    │   │   ├── Header.jsx             # Main header
    │   │   └── Navbar.jsx             # Navigation bar
    │   │
    │   ├── 📁 landing/                # Landing page components
    │   │   ├── Hero.jsx               # Hero section
    │   │   └── GetStarted.jsx         # Get started section
    │   │
    │   ├── 📁 loading/                # Loading components
    │   │   ├── Loader.jsx             # Main loader
    │   │   ├── LoadingSkeleton.jsx    # Skeleton loading
    │   │   └── Skeleton.jsx           # Skeleton component
    │   │
    │   ├── 📁 error/                  # Error components
    │   │   └── ErrorElement.jsx       # Error display component
    │   │
    │   ├── 📁 cardsContainerLayout/   # Card layout components
    │   │   ├── NewItemCard.jsx        # New item card
    │   │   └── ParkCard.jsx           # Parking location card
    │   │
    │   ├── 📁 bookings/               # Booking-related components
    │   │   ├── CityFilter.jsx         # City filtering
    │   │   ├── NewDataGrid.jsx        # Data grid for bookings
    │   │   └── ParksGrid.jsx          # Grid of parking locations
    │   │
    │   ├── 📁 mapBookings/            # Map booking components
    │   │   ├── Map.jsx                # Map component
    │   │   ├── DisplayPark.jsx        # Park display
    │   │   ├── NewPlaces.jsx          # New places component
    │   │   └── Places.jsx             # Places listing
    │   │
    │   ├── 📁 myBookings/             # User booking components
    │   │   └── BookingsMap.jsx        # User bookings map view
    │   │
    │   ├── 📁 singleBooking/          # Single booking components
    │   │   ├── BookingFilters.jsx     # Booking filters
    │   │   ├── Carousel.jsx           # Image carousel
    │   │   ├── ParkNotFound.jsx       # No park found component
    │   │   ├── SingleSlot.jsx         # Individual slot display
    │   │   └── SlotDisplay.jsx        # Slot information display
    │   │
    │   └── 📁 ui/                     # UI components
    │       ├── index.js               # UI component exports
    │       ├── AnimatedCard.jsx       # Animated card component
    │       ├── AnimatedHeader.jsx     # Animated header
    │       ├── AnimatedLoader.jsx     # Animated loader
    │       ├── AnimatedMapContainer.jsx # Animated map container
    │       ├── AnimatedText.jsx       # Animated text
    │       ├── FloatingElements.jsx   # Floating UI elements
    │       ├── GlareCard.jsx          # Glare effect card
    │       └── ShimmerButton.jsx      # Shimmer effect button
    │
    │
    └── 📁 assets/                     # Static assets
        ├── index.js                   # Asset exports
        ├── logo.png                   # Application logo
        ├── car.png                    # Car icon
        ├── parking.png                # Parking icon
        ├── control.png                # Control icon
        ├── basement.jpg               # Basement image
        ├── arrow-up.svg               # Arrow up icon
        ├── close.svg                  # Close icon
        ├── flag.svg                   # Flag icon
        ├── location.svg               # Location icon
        └── menu.svg                   # Menu icon
```

## 🚀 Key Features

### 🗺️ Interactive Mapping
- **Google Maps Integration**: Real-time map-based parking selection
- **Geolocation Support**: Automatic location detection
- **Interactive Markers**: Clickable parking locations
- **Distance Calculations**: Proximity-based recommendations

### 📊 Real-time Analytics
- **AI-Powered Reports**: Google Gemini integration for congestion analysis
- **Government Dashboard**: Comprehensive analytics for city officials
- **Booking Statistics**: Real-time booking data visualization
- **PDF Report Generation**: Automated report creation

### 🔐 Authentication & Security
- **Supabase Auth**: Secure user authentication
- **JWT Tokens**: Secure session management
- **Protected Routes**: Role-based access control
- **User Management**: Registration and profile management

### 📱 User Experience
- **Mobile Responsive**: Optimized for all devices
- **Loading States**: Skeleton loaders and smooth transitions
- **Error Handling**: Comprehensive error management
- **Toast Notifications**: User feedback system

### 🎨 UI/UX Design
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Custom Components**: Reusable UI elements
- **Dark Theme**: Modern design aesthetic

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following key entities:

- **Users**: Authentication and user profiles
- **Parking Slots**: Available parking locations
- **Bookings**: User parking reservations
- **IT Parks**: Commercial parking locations
- **Congestion Data**: Real-time parking analytics

### Key Database Functions
- `get_congestion_data()`: Analyzes parking congestion patterns
- Time-based analysis (morning, afternoon, evening)
- Geographic proximity calculations
- Booking density analysis

## 🔧 Development Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account
- Google Maps API key
- Google Gemini API key

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### Installation
```bash
git clone https://github.com/tanmayrajurkar/PARAS.git
cd PARAS
npm install
npm run dev
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🏗️ Architecture Patterns

### State Management
- **Redux Toolkit**: Centralized state management
- **Feature-based Slices**: Organized by functionality
- **Async Thunks**: API call management

### Component Architecture
- **Atomic Design**: Reusable component hierarchy
- **Container/Presentational**: Separation of concerns
- **Custom Hooks**: Logic abstraction

### Routing
- **React Router v6**: Declarative routing
- **Lazy Loading**: Code splitting for performance
- **Protected Routes**: Authentication-based access

## 🔄 Data Flow

1. **User Interaction** → Component
2. **Component** → Redux Action
3. **Redux Action** → API Service
4. **API Service** → Supabase
5. **Supabase** → Database
6. **Response** → Redux Store
7. **Redux Store** → Component Re-render

## 🎯 Key Components

### Core Pages
- **Landing**: Marketing and feature showcase
- **MapBookings**: Interactive parking selection
- **MyBookings**: User booking management
- **AdminDashboard**: Administrative controls
- **GovDashboard**: Government analytics

### Reusable Components
- **Map Components**: Google Maps integration
- **Booking Components**: Reservation management
- **UI Components**: Animated and interactive elements
- **Form Components**: Data input and validation

## 📈 Performance Optimizations

- **Code Splitting**: Lazy loading of routes
- **Image Optimization**: Compressed assets
- **Bundle Analysis**: Vite build optimization
- **Caching**: React Query for API caching
- **Memoization**: React.memo for expensive components

## 🧪 Testing & Quality

- **ESLint**: Code quality enforcement
- **TypeScript Support**: Type safety (partial)
- **Error Boundaries**: Graceful error handling
- **Mock Server**: Development testing

## 🚀 Deployment

- **Build Tool**: Vite for fast builds
- **Hosting**: Netlify (current)
- **Environment**: Production-ready configuration
- **CDN**: Static asset optimization

---

*This structure represents a modern, scalable React application with comprehensive parking management features, real-time analytics, and government integration capabilities.*
