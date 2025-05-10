import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// PayPal API base URL (use sandbox for testing)
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';
// Using sandbox credentials for development
// In production, these should be set via environment variables
const PAYPAL_CLIENT_ID = 'AV1ESvhViDUGDbd7WQFeY2WGdP7VVOAvQmcFBZIKEAz-yMh6Wxarcfv8klu6GcPJ5engKwF6B4YI2GqW';
const PAYPAL_CLIENT_SECRET = 'EPFfyFbmMkMEtLEUnuHAQ8mZK21qBMCD3BzKuWeOQ7jQw9fcvv14e74vM7btibLic1l9oMhPdHG2wL_L';

// Function to get PayPal access token (same as in route.ts)
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}

// Capture an approved PayPal order
export async function POST(req: NextRequest) {
  try {
    // Get orderID from the URL
    const { searchParams } = new URL(req.url);
    const orderID = searchParams.get('orderID');
    
    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the user's session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('No user session found');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get cart data from the request body
    const requestBody = await req.json();
    const { cartItems, total } = requestBody;

    console.log('Received request body:', JSON.stringify(requestBody));
    console.log('Cart items type:', typeof cartItems);
    console.log('Cart items length:', cartItems?.length);

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('No cart items provided:', requestBody);
      return NextResponse.json(
        { error: 'No cart items provided' },
        { status: 400 }
      );
    }

    // Validate cart items have required fields
    const validCartItems = cartItems.every(item => 
      item && typeof item === 'object' && 
      item.id && item.quantity && 
      (typeof item.price === 'number' || typeof item.price === 'string')
    );

    if (!validCartItems) {
      console.error('Invalid cart items format:', cartItems);
      return NextResponse.json(
        { error: 'Invalid cart items format' },
        { status: 400 }
      );
    }

    console.log('Valid cart items:', cartItems);
    
    // Get access token
    const accessToken = await getPayPalAccessToken();
    
    // Capture the order
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const paypalData = await response.json();
    
    if (paypalData.error) {
      throw new Error(paypalData.error);
    }
    
    console.log('PayPal order successfully captured:', paypalData);
    
    // Save the order to the database
    try {
      // First, verify the user exists
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
      
      if (!userExists) {
        console.error('User not found in database:', session.user.id);
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 400 }
        );
      }
      
      // Next, verify all products exist
      const productIds = cartItems.map(item => item.id);
      console.log('Product IDs to check:', productIds);
      
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        },
        select: { id: true }
      });
      
      console.log('Found products:', products);
      
      const foundProductIds = products.map((p: { id: string }) => p.id);
      const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));
      
      if (missingProductIds.length > 0) {
        console.error('Some products not found in database:', missingProductIds);
        return NextResponse.json(
          { error: 'Some products not found in database', missingProductIds },
          { status: 400 }
        );
      }
      
      // Create the order in the database
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: 'PENDING',
          total: parseFloat(total),
          paymentId: orderID,
          paymentProvider: 'PAYPAL',
          // Create order items
          orderItems: {
            create: cartItems.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });
      
      console.log('Order saved to database:', order);
      
      return NextResponse.json({
        success: true,
        paypalData,
        order
      });
    } catch (dbError) {
      console.error('Error saving order to database:', dbError);
      
      // Add more detailed logging for foreign key issues
      if (dbError instanceof Error && dbError.message.includes('Foreign key constraint')) {
        console.error('Foreign key constraint details:', {
          userId: session.user.id,
          productIds: cartItems.map(item => item.id)
        });
      }
      
      return NextResponse.json(
        { error: 'Error saving order to database', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json(
      { error: 'Error capturing PayPal order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 