export default function ShippingPage() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Shipping Information</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">1. Shipping Methods</h2>
        <p className="mb-4">
          We offer various shipping methods to ensure your Moroccan treasures reach you safely:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><span className="font-medium">Standard Shipping:</span> 5-7 business days</li>
          <li><span className="font-medium">Express Shipping:</span> 2-3 business days</li>
          <li><span className="font-medium">International Shipping:</span> 7-14 business days</li>
        </ul>
        
        <h2 className="text-xl font-bold mb-4 mt-8">2. Shipping Costs</h2>
        <p className="mb-4">
          Shipping costs are calculated based on the weight, dimensions, and destination of your order:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><span className="font-medium">Standard Shipping:</span> $5.99 - $12.99</li>
          <li><span className="font-medium">Express Shipping:</span> $14.99 - $24.99</li>
          <li><span className="font-medium">International Shipping:</span> $19.99 - $49.99</li>
        </ul>
        <p className="mb-4">
          Free standard shipping on orders over $100 (domestic only).
        </p>

        <h2 className="text-xl font-bold mb-4 mt-8">3. Order Processing</h2>
        <p className="mb-4">
          All orders are processed within 1-2 business days. Orders placed on weekends or holidays
          will be processed on the next business day.
        </p>

        <h2 className="text-xl font-bold mb-4 mt-8">4. Tracking</h2>
        <p className="mb-4">
          Once your order ships, you will receive a shipping confirmation email with a tracking number.
          You can track your package directly from your account page or by clicking the tracking link in the email.
        </p>

        <h2 className="text-xl font-bold mb-4 mt-8">5. International Shipping</h2>
        <p className="mb-4">
          Please note that international orders may be subject to import duties, taxes, and customs fees.
          These charges are the responsibility of the recipient and are not included in our shipping costs.
        </p>

        <h2 className="text-xl font-bold mb-4 mt-8">6. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about shipping, please contact our customer service team at:
          shipping@aznit.com
        </p>

        <p className="mt-8 text-sm text-gray-500">Last updated: May 2025</p>
      </div>
    </div>
  );
} 