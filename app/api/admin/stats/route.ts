import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// Define interfaces for type safety
interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get orders with details for proper calculation
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true
      }
    });

    // Calculate total revenue from all orders
    const totalRevenue = orders.reduce((total: number, order: Order) => 
      total + Number(order.total), 0);

    // Get total orders count
    const totalOrders = orders.length;

    // Get pending orders count
    const pendingOrders = orders.filter((order: Order) => order.status === 'PENDING').length;

    // Get total customers (unique users with orders)
    const uniqueCustomerIds = Array.from(new Set(orders.map((order: Order) => order.userId)));
    const totalCustomers = await prisma.user.count();

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get total pending reviews that need moderation
    const pendingReviews = await prisma.review.count({
      where: {
        isApproved: false
      }
    });

    // Get low stock items - since we don't have a quantity field, we'll use inStock
    const lowStockItems = await prisma.product.count({
      where: {
        inStock: false
      }
    });

    // Build and return the stats with growth indicators
    // These would normally be calculated comparing to previous month
    // For now we're using sample growth rates
    const stats = {
      totalRevenue: {
        value: totalRevenue,
        growth: 12 // Sample 12% growth
      },
      totalOrders: {
        value: totalOrders,
        growth: 8 // Sample 8% growth
      },
      totalCustomers: {
        value: totalCustomers,
        growth: 24 // Sample 24% growth
      },
      totalProducts: {
        value: totalProducts,
        growth: 6 // Sample 6% growth
      },
      pendingOrders,
      lowStockItems,
      pendingReviews
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 