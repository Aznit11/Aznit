'use client';

import { useEffect, useState } from 'react';

interface CsrfTokenProps {
  // Optional class name for styling
  className?: string;
}

export default function CsrfToken({ className = '' }: CsrfTokenProps) {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Fetch CSRF token from the server
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/csrf');
        if (response.ok) {
          const data = await response.json();
          setToken(data.csrfToken);
        } else {
          console.error('Failed to fetch CSRF token');
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchToken();
  }, []);

  return <input type="hidden" name="_csrf" value={token} className={className} />;
} 