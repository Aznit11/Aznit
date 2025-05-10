# AzniT Technical Context

## Technology Stack
- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS 
- **State Management**: React Context API with custom hooks
- **Icons**: Heroicons and React Icons
- **Image Handling**: Next.js Image component with local SVG images
- **Routing**: Next.js App Router
- **Form Management**: React hooks for form state and validation

## Development Environment
- **Package Manager**: npm
- **Version Control**: Git
- **Code Editor**: VS Code (recommended)
- **Browser Tools**: React DevTools, Redux DevTools
- **Linting**: ESLint with TypeScript configuration
- **Formatting**: Prettier

## Technical Architecture
- **Client-Side Rendering**: For interactive components and data-dependent pages
- **Static Generation**: For static content like about and contact pages
- **API Routes**: For server-side functionality (future implementation)
- **File-Based Routing**: Using Next.js App Router structure

## Data Management
- **Product Data**: Currently stored in static data files (`lib/data.ts`)
- **Cart State**: Managed via React Context with localStorage persistence
- **Wishlist State**: Managed via WishlistContext with localStorage persistence
- **Chat State**: Managed via ChatContext with session persistence
- **Form State**: Managed with React useState hooks 
- **Future Plans**: 
  - Implement API routes for data fetching
  - Add database integration
  - Develop admin dashboard for content management

## Dependencies
Key packages and their purposes:
- **next**: Frontend framework and routing
- **react**, **react-dom**: Core UI library
- **typescript**: Type safety 
- **tailwindcss**, **postcss**, **autoprefixer**: Styling
- **@heroicons/react**: UI icons
- **react-icons**: Additional icon library

## Context Providers
- **CartContext**: Shopping cart state management
- **AuthProvider**: Authentication state and methods
- **PayPalContext**: Payment processing functionality
- **WishlistContext**: Wishlist item management
- **ChatContext**: Customer support chat functionality

## Performance Considerations
- Image optimization using Next.js Image component
- Code splitting via Next.js dynamic imports
- Component-level state management to avoid unnecessary re-renders
- Lazy loading for off-screen images
- Mobile-first responsive design

## Cross-Browser Compatibility
- Target browsers: Latest versions of Chrome, Firefox, Safari, Edge
- Mobile compatibility: iOS Safari, Android Chrome
- Progressive enhancement approach for features with limited support

## Security Considerations
- Client-side form validation
- Server-side validation needed for actual deployment
- CSRF protection required for production
- Future payment processing will require PCI compliance
- Chat system security for user data protection

## Deployment Strategy
- Development: Local development server
- Future Staging/Production: To be determined
- CI/CD: Not yet implemented 