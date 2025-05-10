declare module '@paypal/react-paypal-js' {
  export interface PayPalScriptOptions {
    'client-id': string;
    currency?: string;
    intent?: 'capture' | 'authorize';
    'data-client-token'?: string;
    components?: string;
    'disable-funding'?: string;
    'enable-funding'?: string;
    'buyer-country'?: string;
    locale?: string;
    debug?: boolean;
    'data-namespace'?: string;
  }

  export interface PayPalButtonsComponentProps {
    style?: {
      layout?: 'vertical' | 'horizontal';
      color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
      shape?: 'rect' | 'pill';
      label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
      height?: number;
      tagline?: boolean;
    };
    createOrder?: (data: any, actions: any) => Promise<string>;
    onApprove?: (data: any, actions: any) => Promise<void>;
    onCancel?: (data: any) => void;
    onError?: (err: any) => void;
    onClick?: (data: any, actions: any) => void;
    onInit?: (data: any, actions: any) => void;
    onShippingChange?: (data: any, actions: any) => void;
    forceReRender?: any[];
    fundingSource?: string;
    disabled?: boolean;
  }

  export interface PayPalHostedFieldsComponentProps {
    styles?: Record<string, any>;
    createOrder?: () => Promise<string>;
    onApprove?: (data: any, actions: any) => Promise<void>;
    onError?: (err: any) => void;
  }

  export function PayPalScriptProvider(props: {
    options: PayPalScriptOptions;
    children: React.ReactNode;
  }): JSX.Element;

  export function PayPalButtons(props: PayPalButtonsComponentProps): JSX.Element;
  
  export function PayPalHostedFields(props: PayPalHostedFieldsComponentProps): JSX.Element;
} 