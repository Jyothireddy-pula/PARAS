# 3D Car Loader Component

A beautiful 3D animated loader featuring a car moving and parking in a parking lot, built with Three.js and React Three Fiber.

## Features

- **3D Car Animation**: A detailed 3D car model with realistic movement
- **Parking Animation**: Car drives in and parks in a designated spot
- **Progress Bar**: Visual progress indicator showing loading percentage
- **Animated Text**: "Loading Dashboard..." text with fade effects
- **Auto-rotation**: Camera automatically rotates around the scene
- **Responsive Design**: Works on all screen sizes

## Components

### Car3DLoader.jsx
The main 3D loader component that includes:
- 3D car model with body, roof, wheels, headlights, and taillights
- Parking lot with marked spaces
- Animated loading text
- Progress bar with percentage display
- Camera controls and lighting

### Loader.jsx (Updated)
Enhanced loader component that can switch between:
- Traditional spinner loader
- 3D car loader (when `show3D={true}`)

## Usage

### Basic Usage
```jsx
import Loader from './components/loading/Loader';

// Show 3D loader
<Loader show3D={true} onComplete={() => console.log('Loading complete!')} />

// Show traditional loader
<Loader />
```

### Direct 3D Loader Usage
```jsx
import Car3DLoader from './components/loading/Car3DLoader';

<Car3DLoader onComplete={() => console.log('Loading complete!')} />
```

## Integration

The 3D loader is automatically integrated into:
- **GovDashboard**: Shows when loading congestion data
- **BookingsDashboard**: Shows when loading booking data

## Demo

Visit `/loader-demo` to see the 3D loader in action with a demo interface.

## Dependencies

- `three`: 3D graphics library
- `@react-three/fiber`: React renderer for Three.js
- `@react-three/drei`: Useful helpers for React Three Fiber
- `prop-types`: Runtime type checking

## Animation Timeline

1. **0-3 seconds**: Car drives in with smooth movement and slight swaying
2. **3-4 seconds**: Car slows down and parks in designated spot
3. **4-5 seconds**: Car idles with subtle bouncing and rotation
4. **Throughout**: Progress bar fills from 0% to 100%
5. **Throughout**: Loading text fades in and out
6. **Throughout**: Camera slowly rotates around the scene

## Customization

You can customize the loader by modifying:
- Car colors and materials
- Animation timing and easing
- Camera position and movement
- Progress bar styling
- Text content and effects

## Performance

The loader is optimized for performance with:
- Efficient 3D geometry
- Minimal re-renders
- Smooth 60fps animations
- Automatic cleanup on unmount
