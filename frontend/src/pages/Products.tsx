import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, type Product, type ProductInput } from '../services/products';
import { useToast } from '../hooks/useToast';
import { 
  Package, Search, Plus, Filter, Edit, Trash2, 
  X, Loader2, ArrowRightLeft, IndianRupee, Layers, ChevronDown
} from 'lucide-react';

// Helper component to display product images with load animations and error fallbacks
const ProductImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  if (!src || error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#f3f6f1] to-[#e7ece4] dark:from-[#192318] dark:to-[#2b3a2a] text-slate-500 dark:text-slate-400">
        <Package className="w-8 h-8 stroke-[1.5] text-[#2b3e2a]/20 dark:text-slate-600" />
        <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider text-[#2b3e2a]/50 dark:text-slate-500">No Preview</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f3f6f1] dark:bg-[#1b251a] animate-pulse">
          <Loader2 className="w-4 h-4 text-[#2b3e2a] dark:text-[#a5bda3] animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form values
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Selected file must be an image", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadProductImage(file);
      setImageUrl(result.image_url);
      showToast("Image uploaded successfully", "success");
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Failed to upload image.";
      showToast(detail, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts(searchTerm || undefined, categoryFilter || undefined);
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to retrieve product list", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setSku('');
    setName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setCategory('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setSku(prod.sku);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(prod.price.toString());
    setQuantity(prod.quantity.toString());
    setCategory(prod.category || '');
    setImageUrl(prod.image_url || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !price || !quantity) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity);

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Price must be a number greater than 0", "warning");
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      showToast("Quantity cannot be negative", "warning");
      return;
    }

    const inputData: ProductInput = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
      price: priceNum,
      quantity: qtyNum,
      category: category.trim() || undefined,
      image_url: imageUrl.trim() || undefined
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, inputData);
        showToast(`Product '${name}' updated successfully`, 'success');
      } else {
        await createProduct(inputData);
        showToast(`Product '${name}' created successfully`, 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Failed to save product.";
      showToast(detail, 'error');
    }
  };

  const handleDelete = async (id: number, prodName: string) => {
    if (window.confirm(`Are you sure you want to delete '${prodName}'?`)) {
      try {
        await deleteProduct(id);
        showToast(`Product '${prodName}' deleted`, 'success');
        fetchProducts();
      } catch (err: any) {
        console.error(err);
        showToast("Failed to delete product", 'error');
      }
    }
  };

  // Extract unique categories for filtering
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div className="space-y-6 page-transition">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Product Catalog</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track and coordinate products, SKUs, and stock quantities.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-xs font-semibold cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#1b251a] p-4 rounded-2xl border border-[#e6eae2] dark:border-[#2b3a2a]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-input !pl-10"
            placeholder="Search by name, SKU code, or category..."
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="dashboard-input !pl-10 !pr-10 appearance-none cursor-pointer bg-white dark:bg-[#1b251a]"
          >
            <option value="">All Categories</option>
            {categories.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 4, 5].map((idx) => (
            <div key={idx} className="clay-card bg-white dark:bg-[#111113] p-5 animate-pulse border border-[#e5e5e7] dark:border-[#232326]">
              <div className="w-12 h-12 bg-slate-205 dark:bg-slate-800 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-205 dark:bg-slate-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-205 dark:bg-slate-800 rounded w-1/2 mb-4" />
              <div className="flex justify-between items-center mt-6">
                <div className="h-4 bg-slate-205 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-4 bg-slate-205 dark:bg-slate-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="clay-card bg-white dark:bg-[#111113] p-12 text-center border border-[#e5e5e7] dark:border-[#232326]">
          <Package className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300 mb-1">No products found</h3>
          <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm mx-auto">Try refining your search text, clearing the category filter, or registering a new product above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const isLow = p.quantity > 0 && p.quantity < 10;
            const isOut = p.quantity === 0;
            return (
              <div key={p.id} className="clay-card p-5 bg-white dark:bg-[#111113] flex flex-col justify-between group">
                <div>
                  {/* Premium Product Image Banner */}
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 bg-[#f3f6f1] dark:bg-[#192318] border border-[#e6eae2] dark:border-[#253224]/80">
                    <ProductImage src={p.image_url} alt={p.name} />

                    {/* Stock Alert Badge */}
                    {(isLow || isOut) && (
                      <span className={`absolute top-3 right-3 text-[9px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                        isOut 
                          ? 'bg-rose-500/90 text-white border-rose-500/20' 
                          : 'bg-amber-500/90 text-slate-900 border-amber-500/20'
                      }`}>
                        {isOut ? 'OUT' : 'LOW STOCK'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-805 dark:text-white text-sm group-hover:text-[#2b3e2a] dark:group-hover:text-[#a5bda3] transition-colors truncate">
                    {p.name}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] bg-[#f3f6f1] dark:bg-[#253224]/80 px-2 py-0.5 rounded text-[#2b3e2a] dark:text-slate-300 font-semibold uppercase tracking-wider">
                      {p.sku}
                    </span>
                    {p.category && (
                      <span className="text-[10px] bg-slate-50 dark:bg-[#253224]/40 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-medium">
                        {p.category}
                      </span>
                    )}
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 line-clamp-2 min-h-[32px]">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#e5e5e7] dark:border-[#232326]/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unit Price</p>
                    <p className="text-sm font-bold text-black dark:text-white">₹{p.price.toLocaleString('en-IN')}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Stock</p>
                    <p className={`text-sm font-extrabold text-right ${
                      isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-black dark:text-white'
                    }`}>
                      {p.quantity} Units
                    </p>
                  </div>
                </div>

                {/* Edit & Delete Action Panel on Hover */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-[#e6eae2] dark:border-[#253224]/45 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#2b3e2a] hover:border-[#2b3e2a] dark:text-slate-400 dark:hover:text-[#a5bda3] dark:hover:border-[#2b3a2a] transition-colors cursor-pointer"
                    title="Edit Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-250 dark:text-slate-400 dark:hover:text-rose-450 dark:hover:border-rose-900 transition-colors cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-[#1b251a] border border-[#e6eae2] dark:border-[#2b3a2a] rounded-3xl w-full max-w-lg shadow-2xl relative z-10 p-6 page-transition">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#2b3e2a]/10 text-[#2b3e2a] dark:bg-[#a5bda3]/10 dark:text-[#a5bda3]">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  {editingProduct ? 'Modify Product Specifications' : 'Register New Product'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#f3f6f1] dark:hover:bg-[#253224] text-slate-400 hover:text-slate-650 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    SKU/Code (Unique) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    disabled={!!editingProduct}
                    className="dashboard-input uppercase disabled:opacity-50"
                    placeholder="E.g., IPHONE15PM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="dashboard-input"
                    placeholder="E.g., iPhone 15 Pro Max"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    Unit Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="dashboard-input"
                    placeholder="999.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="dashboard-input"
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="dashboard-input"
                  placeholder="E.g., Electronics"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product Image
                </label>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#e6eae2] dark:border-[#2b3a2a] shrink-0 bg-[#f3f6f1] dark:bg-[#192318] flex items-center justify-center relative">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-350 dark:text-slate-700" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="image-file-input"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex gap-2">
                      <label
                        htmlFor="image-file-input"
                        className="px-4 py-2 border border-[#e6eae2] dark:border-[#2b3a2a] rounded-xl hover:bg-[#f3f6f1] dark:hover:bg-[#253224] text-xs font-semibold text-slate-700 dark:text-slate-350 transition-colors cursor-pointer inline-block"
                      >
                        Upload Image File
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-4 py-2 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="dashboard-input h-20 resize-none py-2"
                  placeholder="Provide product details, specs, package contents..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#e6eae2] dark:border-[#253224]/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#e6eae2] dark:border-[#2b3a2a] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-[#f3f6f1] dark:hover:bg-[#253224] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gradient-btn text-xs font-semibold cursor-pointer shadow-lg"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
