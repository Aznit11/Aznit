import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

export async function GET(req: NextRequest) {
  // Generate a new CSRF token
  const csrfToken = generateCsrfToken();
  
  // Return the token to the client
  return NextResponse.json({ csrfToken });
} 