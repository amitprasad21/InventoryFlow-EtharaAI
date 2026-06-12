import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, cancelOrder, type Order, type OrderItemInput } from '../services/orders';
import { getCustomers, type Customer } from '../services/customers';
import { getProducts, type Product } from '../services/products';
import { useToast } from '../hooks/useToast';
import { 
  ShoppingCart, Plus, Trash2, X, Loader2, 
  Eye, Calendar, User, Filter, ChevronDown
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Wizard form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Active editing item
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<string>('1');

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const ordersData = await getOrders(statusFilter || undefined);
      setOrders(ordersData);
      
      const customersData = await getCustomers();
      setCustomers(customersData);
      
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch order tracking details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const openCreateModal = () => {
    setSelectedCustomerId('');
    setCart([]);
    setSelectedProductId('');
    setItemQuantity('1');
    setIsCreateModalOpen(true);
  };

  const openDetailsModal = (order: Order) => {
    setActiveOrder(order);
    setIsDetailsModalOpen(true);
  };

  const addToCart = () => {
    if (!selectedProductId || !itemQuantity) {
      showToast("Select a product and quantity", "warning");
      return;
    }

    const prodId = parseInt(selectedProductId);
    const qty = parseInt(itemQuantity);
    
    if (isNaN(qty) || qty <= 0) {
      showToast("Quantity must be greater than 0", "warning");
      return;
    }

    const product = products.find(p => p.id === prodId);
    if (!product) return;

    // Check stock limit
    const existingCartItemIndex = cart.findIndex(item => item.product.id === prodId);
    let totalRequested = qty;
    if (existingCartItemIndex > -1) {
      totalRequested += cart[existingCartItemIndex].quantity;
    }

    if (product.quantity < totalRequested) {
      showToast(`Only ${product.quantity} units of '${product.name}' are available in stock.`, 'warning');
      return;
    }

    if (existingCartItemIndex > -1) {
      // Update quantity
      const newCart = [...cart];
      newCart[existingCartItemIndex].quantity = totalRequested;
      setCart(newCart);
    } else {
      // Add new item
      setCart([...cart, { product, quantity: qty }]);
    }

    // Reset selectors
    setSelectedProductId('');
    setItemQuantity('1');
    showToast(`Added '${product.name}' to checkout items`, 'info');
  };

  const removeFromCart = (index: number) => {
    const updated = cart.filter((_, idx) => idx !== index);
    setCart(updated);
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast("Please select a customer", "warning");
      return;
    }
    if (cart.length === 0) {
      showToast("Checkout items cannot be empty", "warning");
      return;
    }

    const orderItems: OrderItemInput[] = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));

    try {
      await createOrder({
        customer_id: parseInt(selectedCustomerId),
        items: orderItems
      });
      showToast("Order placed successfully!", "success");
      setIsCreateModalOpen(false);
      loadData(); // Re-fetch all
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Failed to process order";
      showToast(detail, "error");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm(`Are you sure you want to cancel Order #${orderId}? This refunds stock levels.`)) {
      try {
        await cancelOrder(orderId);
        showToast(`Order #${orderId} cancelled. Inventory returned.`, 'success');
        loadData();
      } catch (err: any) {
        console.error(err);
        showToast(err.response?.data?.detail || "Failed to cancel order", 'error');
      }
    }
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Order Tracking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dispatch purchases, view invoice details, and issue inventory refunds.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-xs font-semibold cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Status filter panel */}
      <div className="flex bg-white dark:bg-[#1b251a] p-4 rounded-2xl border border-[#e6eae2] dark:border-[#2b3a2a]">
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dashboard-input !pl-10 !pr-10 appearance-none cursor-pointer bg-white dark:bg-[#1b251a]"
          >
            <option value="">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table view */}
      <div className="clay-card bg-white dark:bg-[#111113] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
            <p className="text-xs font-medium">Retrieving transaction registers...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center border-[#e5e5e7] dark:border-[#232326]">
            <ShoppingCart className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300 mb-1">No orders found</h3>
            <p className="text-xs text-slate-455 dark:text-slate-500 max-w-sm mx-auto">Click "Create Order" to launch the setup flow wizard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e7] dark:border-[#232326]/60 bg-[#f5f5f7]/40 dark:bg-[#18181c]/20">
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-6">Order ID</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Value</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e7] dark:divide-[#232326]/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#f3f6f1]/40 dark:hover:bg-[#2b3a2a]/10 transition-colors">
                    {/* Order ID */}
                    <td className="p-4 pl-6 text-xs font-bold text-slate-850 dark:text-slate-200">
                      #{o.id}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{o.customer_name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{o.customer_email}</p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(o.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-4 text-xs font-bold text-black dark:text-white">
                      ₹{o.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Pill */}
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        o.status === 'Delivered'
                          ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                          : o.status === 'Processing'
                          ? 'bg-slate-100 text-slate-700 dark:bg-[#18181c] dark:text-slate-300'
                          : o.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right pr-6 space-x-2">
                      <button
                        onClick={() => openDetailsModal(o)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-[#e6eae2] dark:border-[#2b3a2a] hover:bg-[#f3f6f1] dark:hover:bg-[#253224] text-[#2b3e2a] dark:text-[#a5bda3] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>
                      {o.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-550 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {isDetailsModalOpen && activeOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)} />
                   <div className="bg-white dark:bg-[#111113] border border-[#e5e5e7] dark:border-[#232326] rounded-3xl w-full max-w-lg shadow-2xl relative z-10 p-6 page-transition">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Order Specifications: #{activeOrder.id}
              </h3>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#232326] text-slate-400 hover:text-slate-650 dark:text-slate-450 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer info card */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#18181c] border border-[#e5e5e7] dark:border-[#232326] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/5 border border-black/10 text-black dark:bg-white/10 dark:border-white/20 dark:text-white flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-black dark:text-white">{activeOrder.customer_name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{activeOrder.customer_email}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Purchased Items</h4>
                <div className="border border-[#e5e5e7] dark:border-[#232326] rounded-2xl overflow-hidden divide-y divide-[#e5e5e7] dark:divide-[#232326]/60">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-slate-50/20">
                      <div>
                        <p className="font-bold text-black dark:text-white">{item.product_name || 'Deleted Product'}</p>
                        <p className="text-[10px] text-slate-400">SKU: {item.product_sku || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700 dark:text-slate-300">{item.quantity} x ₹{item.price.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-slate-500 font-bold">₹{(item.quantity * item.price).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-[#e5e5e7] dark:border-[#232326] flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    activeOrder.status === 'Delivered'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : activeOrder.status === 'Cancelled'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {activeOrder.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</p>
                  <p className="text-lg font-extrabold text-black dark:text-white">₹{activeOrder.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 gradient-btn text-xs font-semibold cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Flow Wizard Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          
          <div className="bg-white dark:bg-[#111113] border border-[#e5e5e7] dark:border-[#232326] rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 p-6 page-transition">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-black/5 text-black dark:bg-white/15 dark:text-white">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-black dark:text-white text-base">
                  Checkout Wizard
                </h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#232326] text-slate-400 hover:text-slate-650 dark:text-slate-450 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Step 1: Select Customer */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Select Customer Account <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="dashboard-input appearance-none !pr-10 cursor-pointer bg-white dark:bg-[#111113]"
                    required
                  >
                    <option value="">-- Click to select account --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#e5e5e7] dark:border-[#232326]">
                {/* Left pane: Add Products */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Add Products to Order</h4>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Select Product</label>
                    <div className="relative">
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="dashboard-input appearance-none !pr-10 cursor-pointer text-xs bg-white dark:bg-[#111113]"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                            {p.name} - ₹{p.price.toLocaleString('en-IN')} (Stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="dashboard-input text-xs"
                      placeholder="1"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addToCart}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-black text-black dark:border-white dark:text-white hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                  >
                    Add Product Line
                  </button>
                </div>

                {/* Right pane: Checkout Cart */}
                <div className="flex flex-col justify-between p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#18181c] border border-[#e5e5e7] dark:border-[#232326]">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">Checkout Items</h4>
                    <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
                      {cart.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-6 text-center">Your order checkout list is empty.</p>
                      ) : (
                        cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-1.5 border-b border-[#e5e5e7] dark:border-[#232326]/40 last:border-b-0">
                            <div>
                              <p className="font-bold text-black dark:text-white truncate max-w-[150px]">{item.product.name}</p>
                              <p className="text-[9px] text-slate-400">{item.quantity} x ₹{item.product.price.toLocaleString('en-IN')}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#e5e5e7] dark:border-[#232326]/60 mt-4 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Estimated Total</span>
                    <span className="text-base font-extrabold text-black dark:text-white">₹{calculateCartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e5e7] dark:border-[#232326] mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#e5e5e7] dark:border-[#232326] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-[#f5f5f7] dark:hover:bg-[#18181c] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="px-4 py-2 gradient-btn text-xs font-semibold cursor-pointer shadow-lg disabled:opacity-50"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
