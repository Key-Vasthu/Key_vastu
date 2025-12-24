import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ArrowLeft,
  Tag,
  Truck,
  Shield,
  CreditCard,
  MapPin,
  Check,
} from 'lucide-react';
import { Button, Card, Input, Badge, Modal, Loading } from '../components/common';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatCurrency } from '../utils/helpers';
import { validators } from '../utils/validation';
import { ordersApi } from '../utils/api';

// Quantity Input Component with local state for clearing
interface QuantityInputProps {
  quantity: number;
  bookId: string;
  onUpdate: (bookId: string, quantity: number) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ quantity, bookId, onUpdate }) => {
  const [localValue, setLocalValue] = useState<string>(quantity.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Sync with cart item quantity when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(quantity.toString());
    }
  }, [quantity, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    // Only update cart if valid number
    if (inputValue !== '' && inputValue !== '-') {
      const value = parseInt(inputValue);
      if (!isNaN(value) && value >= 1) {
        onUpdate(bookId, value);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const value = parseInt(localValue);
    if (!value || value < 1 || isNaN(value)) {
      setLocalValue('1');
      onUpdate(bookId, 1);
    } else {
      onUpdate(bookId, value);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  return (
    <input
      type="number"
      min="1"
      value={localValue}
      onFocus={handleFocus}
      onClick={(e) => {
        e.currentTarget.select();
      }}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      placeholder="Qty"
      title="Click to enter quantity manually - clear and type new number"
      className="quantity-input px-4 py-2 font-medium min-w-[70px] w-[70px] text-center border-0 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white cursor-text"
    />
  );
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotification();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      addNotification('warning', 'Login Required', 'Please login to view your cart.');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, addNotification]);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment' | 'confirm'>('address');
  const [isProcessing, setIsProcessing] = useState(false);

  // Address form state
  const [addressData, setAddressData] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // Form errors
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const shippingCost = totalAmount >= 499 ? 0 : 49;
  const couponDiscount = appliedCoupon?.discount || 0;
  const finalTotal = totalAmount + shippingCost - couponDiscount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'VASTHU10') {
      const discount = Math.round(totalAmount * 0.1);
      setAppliedCoupon({ code: 'VASTHU10', discount });
      addNotification('success', 'Coupon Applied!', `You saved ${formatCurrency(discount)}`);
    } else if (couponCode.toUpperCase() === 'FIRST50') {
      setAppliedCoupon({ code: 'FIRST50', discount: 50 });
      addNotification('success', 'Coupon Applied!', 'You saved ₹50');
    } else {
      addNotification('error', 'Invalid Coupon', 'Please enter a valid coupon code.');
    }
    setCouponCode('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      addNotification('warning', 'Login Required', 'Please login to proceed with checkout.');
      navigate('/login');
      return;
    }
    // Reset form when opening checkout
    setAddressData({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    });
    setPaymentMethod('');
    setAddressErrors({});
    setCheckoutStep('address');
    setShowCheckoutModal(true);
  };

  // Validate address form
  const validateAddress = (): boolean => {
    const errors: Record<string, string> = {};

    if (!addressData.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!addressData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validators.phone(addressData.phone.trim());
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error || 'Please enter a valid phone number';
      }
    }

    if (!addressData.line1.trim()) {
      errors.line1 = 'Address line 1 is required';
    }

    if (!addressData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!addressData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!addressData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else {
      const pincodeValidation = validators.pincode(addressData.pincode.trim());
      if (!pincodeValidation.isValid) {
        errors.pincode = pincodeValidation.error || 'Please enter a valid pincode';
      }
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate payment method
  const validatePayment = (): boolean => {
    return paymentMethod !== '';
  };

  // Handle address form change
  const handleAddressChange = (field: string, value: string) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (addressErrors[field]) {
      setAddressErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle next step from address
  const handleAddressNext = () => {
    if (validateAddress()) {
      setCheckoutStep('payment');
    } else {
      addNotification('warning', 'Incomplete Form', 'Please fill in all required fields correctly.');
    }
  };

  // Handle next step from payment
  const handlePaymentNext = () => {
    if (validatePayment()) {
      setCheckoutStep('confirm');
    } else {
      addNotification('warning', 'Payment Method Required', 'Please select a payment method.');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Create order in database
      const response = await ordersApi.createOrder(
        items,
        finalTotal,
        paymentMethod,
        addressData
      );

      if (response.success && response.data) {
    setIsProcessing(false);
    setShowCheckoutModal(false);
    clearCart();
        addNotification('success', 'Order Placed!', `Order #${response.data.id} has been placed successfully. Check your dashboard for order status.`);
    navigate('/dashboard');
      } else {
        setIsProcessing(false);
        addNotification('error', 'Order Failed', response.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      addNotification('error', 'Order Failed', 'Failed to place order. Please check if the backend server is running.');
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading fullScreen text="Loading cart..." />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-earth-100 rounded-full flex items-center justify-center">
            <ShoppingCart size={40} className="text-earth-400" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-earth-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-earth-500 mb-6">
            Looks like you haven't added any books yet.
          </p>
          <Link to="/books">
            <Button variant="primary" leftIcon={<ArrowLeft size={18} />}>
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-earth-50 py-8">
      <style>{`
        .quantity-input::-webkit-inner-spin-button,
        .quantity-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .quantity-input {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/books" className="inline-flex items-center gap-2 text-earth-500 hover:text-saffron-600 mb-4">
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-display font-bold text-astral-500">
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.book.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                >
                  <Card className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-full sm:w-32 h-44 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-semibold text-earth-800">
                            {item.book.title}
                          </h3>
                          <p className="text-sm text-earth-500">{item.book.author}</p>
                          <Badge variant="neutral" size="sm" className="mt-2">{item.book.category}</Badge>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.book.id)}
                          className="p-2 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-earth-600 font-medium">Quantity:</label>
                          <div className="flex items-center border-2 border-earth-200 rounded-lg overflow-hidden hover:border-saffron-400 transition-colors">
                            <button
                              onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                              className="px-3 py-2 hover:bg-earth-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <QuantityInput
                              quantity={item.quantity}
                              bookId={item.book.id}
                              onUpdate={updateQuantity}
                            />
                            <button
                              onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                              className="px-3 py-2 hover:bg-earth-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-saffron-600">
                            {formatCurrency(item.book.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-earth-500">
                              {formatCurrency(item.book.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-xl font-display font-semibold text-astral-500 mb-6">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      leftIcon={<Tag size={18} />}
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700 font-medium">
                      {appliedCoupon.code} applied
                    </span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <p className="text-xs text-earth-500 mt-2">
                  Try: <code className="bg-earth-100 px-1">VASTHU10</code> for 10% off
                </p>
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm border-t border-earth-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-earth-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-earth-800">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : 'text-earth-800'}>
                    {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-earth-100 pt-3">
                  <span className="text-earth-800">Total</span>
                  <span className="text-saffron-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="mt-6"
                onClick={handleCheckout}
                rightIcon={<ChevronRight size={20} />}
              >
                Proceed to Checkout
              </Button>

              {/* Trust badges */}
              <div className="mt-6 space-y-3 text-sm text-earth-500">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-saffron-500" />
                  {totalAmount >= 499 ? 'Free shipping on this order!' : 'Free shipping on orders above ₹499'}
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-600" />
                  Secure payment & 7-day return policy
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="Checkout"
        size="lg"
      >
        <div className="p-6">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {(['address', 'payment', 'confirm'] as const).map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 ${
                  checkoutStep === step ? 'text-saffron-600' :
                  ['address', 'payment', 'confirm'].indexOf(checkoutStep) > index
                    ? 'text-green-600' : 'text-earth-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    checkoutStep === step ? 'bg-saffron-500 text-white' :
                    ['address', 'payment', 'confirm'].indexOf(checkoutStep) > index
                      ? 'bg-green-500 text-white' : 'bg-earth-200'
                  }`}>
                    {['address', 'payment', 'confirm'].indexOf(checkoutStep) > index ? (
                      <Check size={16} />
                    ) : index + 1}
                  </div>
                  <span className="hidden sm:block capitalize font-medium">{step}</span>
                </div>
                {index < 2 && <div className="w-8 h-0.5 bg-earth-200" />}
              </React.Fragment>
            ))}
          </div>

          {checkoutStep === 'address' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-earth-800 flex items-center gap-2">
                <MapPin size={18} className="text-saffron-500" />
                Shipping Address
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={addressData.name}
                  onChange={(e) => handleAddressChange('name', e.target.value)}
                  error={addressErrors.name}
                  required
                />
                <Input
                  label="Phone"
                  placeholder="9876543210"
                  type="tel"
                  value={addressData.phone}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                  error={addressErrors.phone}
                  required
                />
              </div>
              <Input
                label="Address Line 1"
                placeholder="House/Flat No., Building Name"
                value={addressData.line1}
                onChange={(e) => handleAddressChange('line1', e.target.value)}
                error={addressErrors.line1}
                required
              />
              <Input
                label="Address Line 2"
                placeholder="Street, Area (Optional)"
                value={addressData.line2}
                onChange={(e) => handleAddressChange('line2', e.target.value)}
                error={addressErrors.line2}
              />
              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="Mumbai"
                  value={addressData.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  error={addressErrors.city}
                  required
                />
                <Input
                  label="State"
                  placeholder="Maharashtra"
                  value={addressData.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  error={addressErrors.state}
                  required
                />
                <Input
                  label="Pincode"
                  placeholder="400001"
                  type="text"
                  maxLength={6}
                  value={addressData.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, ''))}
                  error={addressErrors.pincode}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setShowCheckoutModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddressNext}>
                  Continue to Payment
                </Button>
              </div>
            </motion.div>
          )}

          {checkoutStep === 'payment' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-earth-800 flex items-center gap-2">
                <CreditCard size={18} className="text-saffron-500" />
                Payment Method
              </h3>
              <div className="space-y-3">
                {['Credit/Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === method
                        ? 'border-saffron-500 bg-saffron-50'
                        : 'border-earth-200 hover:border-saffron-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-saffron-500"
                    />
                    <span className="font-medium text-earth-800">{method}</span>
                  </label>
                ))}
              </div>
              {!paymentMethod && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> Please select a payment method to continue
                </p>
              )}
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 text-sm text-earth-700">
                <p>This is a demo checkout. No actual payment will be processed.</p>
              </div>
              <div className="flex justify-between gap-3 mt-6">
                <Button variant="ghost" onClick={() => setCheckoutStep('address')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePaymentNext}
                  disabled={!paymentMethod}
                >
                  Review Order
                </Button>
              </div>
            </motion.div>
          )}

          {checkoutStep === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-earth-800">Order Summary</h3>
              
              {/* Shipping Address Summary */}
              <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
                <h4 className="font-medium text-earth-800 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-saffron-500" />
                  Shipping Address
                </h4>
                <div className="text-sm text-earth-600 space-y-1">
                  <p className="font-medium text-earth-800">{addressData.name}</p>
                  <p>{addressData.line1}</p>
                  {addressData.line2 && <p>{addressData.line2}</p>}
                  <p>{addressData.city}, {addressData.state} - {addressData.pincode}</p>
                  <p>Phone: {addressData.phone}</p>
                </div>
              </div>

              {/* Payment Method Summary */}
              <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
                <h4 className="font-medium text-earth-800 mb-2 flex items-center gap-2">
                  <CreditCard size={16} className="text-saffron-500" />
                  Payment Method
                </h4>
                <p className="text-sm text-earth-600">{paymentMethod}</p>
              </div>
              <div className="border border-earth-200 rounded-xl divide-y divide-earth-100">
                {items.map((item) => (
                  <div key={item.book.id} className="flex items-center gap-4 p-4">
                    <img src={item.book.coverImage} alt={item.book.title} className="w-16 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-earth-800">{item.book.title}</p>
                      <p className="text-sm text-earth-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-earth-800">{formatCurrency(item.book.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-earth-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-earth-600">Subtotal</span>
                  <span className="text-earth-800">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Shipping</span>
                  <span className="text-earth-800">{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-earth-200 pt-2">
                  <span>Total</span>
                  <span className="text-saffron-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
              <div className="flex justify-between gap-3 mt-6">
                <Button variant="ghost" onClick={() => setCheckoutStep('payment')}>
                  Back
                </Button>
                <Button
                  variant="gold"
                  onClick={handlePlaceOrder}
                  isLoading={isProcessing}
                  leftIcon={<Check size={18} />}
                >
                  Place Order
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Cart;

