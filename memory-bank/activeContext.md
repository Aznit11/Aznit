# AzniT Active Context

## Current Focus
The project is currently focused on enhancing user experience, extending functionality with new features like wishlists and customer chat support, and continuing to implement authentication. The main goal is to complete the minimum viable product (MVP) for the e-commerce website with full shopping capabilities.

## Recent Changes
1. **Implemented Wishlist Functionality**:
   - Added WishlistContext provider for state management
   - Created wishlist persistence using localStorage
   - Implemented add/remove functionality for wishlist items
   - Added wishlist UI components

2. **Added Customer Chat Support**:
   - Implemented ChatContext provider for managing chat state
   - Created chat interface for customer support
   - Added real-time messaging capabilities
   - Integrated chat widget across the application

3. **Fixed Duplicate Navbar Issue**:
   - Removed redundant Layout wrapper component from all page components
   - Ensured only a single Navbar is rendered from the root layout.tsx
   - Updated all affected pages: products, product details, about, contact, cart, checkout, and checkout result pages
   - Improved overall UI consistency across the site

4. **Payment Processing Integration**:
   - Implemented PayPal payment integration
   - Created payment success and cancel pages
   - Added order confirmation with order ID tracking

5. **Authentication System**:
   - Added NextAuth.js integration for authentication
   - Implemented login/logout functionality
   - Created user registration system
   - Set up secure password hashing
   - Added route protection via middleware

6. **Database Integration**:
   - Configured Prisma with SQLite database
   - Created database models for users, products, orders
   - Set up environment variables for database connections

7. **Admin Dashboard**:
   - Created basic admin dashboard functionality
   - Restricted access to admin users
   - Added utility to assign admin roles

8. **Reviews and Ratings System**:
   - Implemented customer review submission functionality
   - Created review moderation system for admins
   - Added star rating mechanism
   - Displayed reviews on product detail pages
   - Connected reviews to authenticated users
   - Set up approval workflow for new reviews

## Next Steps
1. **User Profile Enhancement**:
   - Add order history to user profiles
   - Enable saved addresses for faster checkout
   - Implement account settings page

2. **Product Management**:
   - Complete admin product management interface
   - Add inventory management capabilities
   - Implement product image uploads

3. **Performance Optimization**:
   - Optimize image loading and caching
   - Improve server-side rendering for better SEO
   - Add loading states and skeleton screens

4. **Analytics Implementation**:
   - Set up basic analytics tracking
   - Create admin dashboard with key metrics
   - Implement sales reporting features

5. **Chat System Enhancement**:
   - Add support for file attachments in chat
   - Implement chat history persistence
   - Create admin chat management interface

## Active Decisions and Considerations

### Technical Decisions
1. **Layout Structure**: Consolidated on using the root layout.tsx to provide the main layout with navbar and footer instead of wrapping each page
2. **Authentication**: Using NextAuth.js for secure, flexible authentication
3. **Database**: Using Prisma with SQLite for development, will migrate to PostgreSQL for production
4. **Form Validation**: Client-side validation for immediate feedback, server-side validation for security
5. **Review System**: Implemented with moderation to ensure quality content
6. **State Management**: Using Context API for global state (cart, wishlist, chat, auth)

### Design Decisions
1. **Mobile-First Approach**: Building responsive layouts starting with mobile devices
2. **Color Scheme**: Using the Moroccan-inspired color palette established in the project brief
3. **Typography**: Using serif fonts for headings and sans-serif for body text to create visual hierarchy
4. **UI Consistency**: Ensuring consistent UI elements and behaviors across all pages
5. **Review UI**: Star rating system with clear submission forms and helpful user feedback
6. **Chat Interface**: Floating chat widget with minimized/expanded states

### Open Questions
1. What additional security measures do we need for the payment process?
2. How should we handle product inventory management?
3. Should we implement real-time notifications for order status updates?
4. Do we need to implement internationalization for multiple languages?
5. Should we implement a more sophisticated review filtering system (e.g., verified purchases)?
6. How can we optimize the chat system for high traffic periods?

## Current Challenges
1. Ensuring secure authentication and authorization flows
2. Managing user data in compliance with privacy regulations
3. Optimizing performance with image-heavy product pages
4. Balancing feature development with technical debt management
5. Ensuring high-quality review content through effective moderation
6. Scaling the chat support system for larger user bases 