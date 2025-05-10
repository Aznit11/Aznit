import { NextRequest, NextResponse } from 'next/server';

// PayPal API base URL (use sandbox for testing)
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';
// Using sandbox credentials for development
// In production, these should be set via environment variables
const PAYPAL_CLIENT_ID = 'AV1ESvhViDUGDbd7WQFeY2WGdP7VVOAvQmcFBZIKEAz-yMh6Wxarcfv8klu6GcPJ5engKwF6B4YI2GqW';
const PAYPAL_CLIENT_SECRET = 'EPFfyFbmMkMEtLEUnuHAQ8mZK21qBMCD3BzKuWeOQ7jQw9fcvv14e74vM7btibLic1l9oMhPdHG2wL_L';

// Function to get PayPal access token
async function getPayPalAccessToken() {
  try {
    console.log('Getting PayPal access token with credentials...');
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!response.ok) {
      console.error('Error getting access token. Status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to get access token: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.access_token) {
      console.error('No access token in response:', data);
      throw new Error('No access token in response');
    }
    
    console.log('Successfully obtained PayPal access token');
    return data.access_token;
  } catch (error) {
    console.error('Exception in getPayPalAccessToken:', error);
    throw error;
  }
}

// Create PayPal order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get checkout data from request body
    const { amount, currency = 'USD', items } = body;
    
    console.log('Received order request:', { amount, currency });
    
    if (!amount) {
      console.error('Missing required field: amount');
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }
    
    // Get access token
    try {
      const accessToken = await getPayPalAccessToken();
      
      // Round amount to 2 decimal places to avoid PayPal DECIMAL_PRECISION error
      const roundedAmount = parseFloat(amount).toFixed(2);
      
      // Simplified order format
      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: roundedAmount
            }
          }
        ]
      };
      
      console.log('Creating PayPal order with payload:', JSON.stringify(orderPayload));
      
      // Create order
      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `order-${Date.now()}`
        },
        body: JSON.stringify(orderPayload),
      });
      
      if (!response.ok) {
        console.error('Error creating order. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return NextResponse.json(
          { error: `Failed to create PayPal order: ${errorText}` },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log('PayPal create order response:', data);
      
      if (!data.id) {
        console.error('No order ID in response:', data);
        return NextResponse.json(
          { error: 'No order ID in PayPal response' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(data);
    } catch (tokenError) {
      console.error('Error in payment process:', tokenError);
      return NextResponse.json(
        { error: 'Payment processing error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Error creating PayPal order' },
      { status: 500 }
    );
  }
} 