import { NextRequest, NextResponse } from 'next/server';
import Tokens from 'csrf';
import { cookies } from 'next/headers';

// Initialize CSRF tokens
const tokens = new Tokens();

// Generate a CSRF token and set it as a cookie
export function generateCsrfToken() {
  // Create a secret
  const secret = tokens.secretSync();
  // Create a token based on the secret
  const token = tokens.create(secret);
  
  // Set cookies
  cookies().set('csrf_secret', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  
  return token;
}

// Get the CSRF token to include in forms
export function getCsrfToken() {
  const secret = cookies().get('csrf_secret')?.value;
  if (!secret) {
    return generateCsrfToken();
  }
  
  return tokens.create(secret);
}

// Verify a CSRF token from a request
export function verifyCsrfToken(token: string) {
  const secret = cookies().get('csrf_secret')?.value;
  if (!secret) {
    return false;
  }
  
  return tokens.verify(secret, token);
}

// Middleware to protect API routes
export async function csrfProtection(req: NextRequest) {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return null;
  }
  
  try {
    // Get the CSRF token from the request header or body
    const csrfToken = req.headers.get('x-csrf-token') || 
                     (await req.json())._csrf;
    
    // Get the secret from cookies
    const secret = req.cookies.get('csrf_secret')?.value;
    
    if (!csrfToken || !secret) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }
    
    // Verify the token
    if (!tokens.verify(secret, csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    // Token is valid
    return null;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    );
  }
} 