# AzniT - Moroccan Traditional Products E-commerce

AzniT is an e-commerce platform showcasing authentic Moroccan traditional products.

## Features

- Responsive design that works beautifully on all devices
- Product catalog with categories and filtering
- Shopping cart functionality
- Checkout process
- Beautiful UI with Moroccan-inspired design elements

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Images**: Unsplash (for demo purposes)
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/aznit.git
cd aznit
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=/j0uYa5H+C9G35GorLvobKdsBiKJwFdVDpAOCartkqA=

# OAuth Providers (Google - Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Create and migrate the database

```bash
npx prisma migrate dev
```

5. Run the development server

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setting Up Environment Variables

### NEXTAUTH_SECRET
This is a random string used to hash tokens and sign cookies. You can generate one using the command:

```bash
openssl rand -base64 32
```

Or by using an online tool or simply creating a random string.

### NEXTAUTH_URL
This is the canonical URL of your site. In development, this is `http://localhost:3000`. 
In production, this should be your production URL, such as `https://your-site.com`.

### Google OAuth (Optional)
To enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Set up OAuth consent screen
4. Create OAuth credentials
   - Choose "Web application" as the application type
   - Add your domain to authorized JavaScript origins (e.g., `http://localhost:3000` for development)
   - Add redirect URI (e.g., `http://localhost:3000/api/auth/callback/google` for development)
5. Copy the Client ID and Client Secret to your `.env.local` file

## Project Structure

```
aznit/
├── app/                   # Next.js app directory
│   ├── about/             # About page
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── contact/           # Contact page
│   ├── products/          # Products pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── product/           # Product-related components
│   ├── cart/              # Cart-related components
│   └── ui/                # UI components
├── lib/                   # Utilities and data
├── public/                # Static assets
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```

## Future Enhancements

- User authentication
- Payment gateway integration
- Product search functionality
- Customer reviews system
- Admin dashboard for product management
- Internationalization for multiple languages

## License

This project is licensed under the MIT License.

## Acknowledgments

- Images from [Unsplash](https://unsplash.com)
- Tailwind CSS for the styling system
- Next.js team for the incredible framework 