
import React, { useState, useEffect, useRef } from 'react';
import { Product, SaleItem, Sale, Customer, User, DocumentType, StoreSettings } from '../types';
import { IntegrationService } from '../services/integrationService';

interface POSProps {
  products: Product[];
  customers: Customer[];
  currentUser: User;
  settings: StoreSettings;
  onCompleteSale: (sale: Sale) => void;
}

const POS: React.FC<POSProps> = ({ products, customers, currentUser, settings, onCompleteSale }) => {
  // Removed saleStep state to enable direct access to POS
  // Initialize origin with the first channel or 'Balcão'
  const [selectedOrigin, setSelectedOrigin] = useState<string>(settings.salesChannels[0] || 'Balcão');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [weightInput, setWeightInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('card');
  const [docType, setDocType] = useState<DocumentType>('CUPOM');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [nfCpf, setNfCpf] = useState(''); // New State for CPF na Nota
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'none' | 'processing' | 'success'>('none');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const barcodeBuffer = useRef('');
  const lastKeyTime = useRef(0);

  // Focus ref for the customer search input
  const customerInputRef = useRef<HTMLInputElement>(null);

  const handleSelectProduct = (product: Product) => {
      if (product.unit === 'un') {
          const newItem: SaleItem = {
              productId: product.id,
              name: product.name,
              quantity: 1,
              price: product.pricePerUnit,
              total: product.pricePerUnit,
              unit: 'un'
          };
          const existingIdx = cart.findIndex(i => i.productId === product.id);
          if (existingIdx >= 0) {
              const updatedCart = [...cart];
              updatedCart[existingIdx].quantity += 1;
              updatedCart[existingIdx].total = updatedCart[existingIdx].quantity * updatedCart[existingIdx].price;
              setCart(updatedCart);
          } else {
              setCart([...cart, newItem]);
          }
          setSearch('');
      } else {
          setSelectedProduct(product);
          setWeightInput('');
      }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture barcode if user is typing in a text input
      if (document.activeElement?.tagName === 'INPUT') return;

      const now = Date.now();
      if (now - lastKeyTime.current > 50) barcodeBuffer.current = '';
      if (e.key === 'Enter') {
        const barcode = barcodeBuffer.current;
        if (barcode.length > 3) {
           const found = products.find(p => p.barcode === barcode || p.sku === barcode);
           if (found) handleSelectProduct(found);
        }
        barcodeBuffer.current = '';
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
      lastKeyTime.current = now;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, cart]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.scaleCode.includes(search) || p.barcode === search);
  
  // Improved customer search logic
  const filteredCustomers = customerSearch.length > 0 
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.cpf.includes(customerSearch))
    : [];

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNfCpf(customer.cpf);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const removeCustomer = () => {
    setSelectedCustomer(null);
    setNfCpf('');
    setCustomerSearch('');
  };

  const addToCart = () => {
    if (!selectedProduct || !weightInput) return;
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) { alert("Peso inválido."); return; }
    const newItem: SaleItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity: weight,
      price: selectedProduct.pricePerUnit,
      total: selectedProduct.pricePerUnit * weight,
      unit: 'kg'
    };
    setCart([...cart, newItem]);
    setSelectedProduct(null);
    setWeightInput('');
    setSearch('');
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);

  const calculatePoints = () => {
     if (!settings.loyaltyEnabled || settings.loyaltySpendThreshold <= 0) return 0;
     const multiplier = Math.floor(totalAmount / settings.loyaltySpendThreshold);
     return multiplier * settings.loyaltyPointValue;
  };
  const pointsToEarn = calculatePoints();

  const handleFinishSale = async () => {
    if (cart.length === 0) return;
    setIsProcessingPayment(true);
    setPaymentStep('processing');
    
    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentStep('success');

    // --- INTEGRATIONS TRIGGERS ---
    const tempSaleId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const saleData: Sale = {
        id: tempSaleId,
        companyId: '', 
        timestamp: new Date(),
        items: cart,
        totalAmount,
        paymentMethod,
        documentType: docType,
        customerId: selectedCustomer?.id,
        nfCpf: nfCpf, // Capture CPF specifically for Note
        sellerId: currentUser.id,
        origin: selectedOrigin
    };

    // 2. Trigger Integrations (Async/Non-blocking mostly)
    if (paymentMethod === 'pix' || paymentMethod === 'card') {
        IntegrationService.createAsaasCharge(saleData, selectedCustomer, settings);
    }
    if (selectedCustomer?.phone) {
        IntegrationService.sendWhatsAppReceipt(saleData, selectedCustomer.phone, settings);
    }
    if (docType === 'NFE') {
        IntegrationService.emitNfeTiny(saleData, settings);
    }

    setTimeout(() => {
        finalize(saleData);
    }, 1000);
  };

  const finalize = (saleData: Sale) => {
    onCompleteSale(saleData);
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setNfCpf('');
    // No need to setSaleStep anymore
    setIsProcessingPayment(false);
    setPaymentStep('none');
  };

  // Payment Method Translation Map
  const paymentLabels: Record<string, string> = {
      'cash': 'Dinheiro',
      'card': 'Cartão',
      'pix': 'Pix'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] animate-in slide-in-from-right-10 duration-500">
      
      {/* LEFT COLUMN: Product Grid */}
      <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
        {/* Search Bar */}
        <div className="flex gap-4">
             {/* Removed Back Button since there is no 'identify' screen anymore */}
             <div className="flex-1 bg-white border border-stone-200 rounded-2xl flex items-center px-6 shadow-sm">
                <i className="fa-search text-stone-400 mr-4"></i>
                <input 
                  type="text" 
                  placeholder="Pesquisar Produto (Nome, PLU ou EAN)..." 
                  className="flex-1 py-4 bg-transparent outline-none font-bold text-stone-700 placeholder:font-medium placeholder:text-stone-400" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
             </div>
        </div>
        
        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-2 content-start">
            {filteredProducts.map(product => (
                <button key={product.id} onClick={() => handleSelectProduct(product)} className={`p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${selectedProduct?.id === product.id ? 'border-emerald-500 bg-emerald-50' : 'border-white bg-white hover:border-emerald-200'}`}>
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform"><i className="fa-leaf text-4xl"></i></div>
                    <p className="font-bold text-stone-800 mb-2 h-10 overflow-hidden relative z-10 leading-tight">{product.name}</p>
                    <div className="flex items-end justify-between relative z-10">
                        <span className="text-xl font-black text-emerald-700">R$ {product.pricePerUnit.toFixed(2)}</span>
                        <span className="text-[10px] uppercase font-black text-stone-400 bg-stone-100 px-2 py-1 rounded">{product.unit}</span>
                    </div>
                </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-stone-400 h-64">
                 <i className="fa-box-open text-4xl mb-2"></i>
                 <p className="font-medium">Nenhum produto encontrado.</p>
              </div>
            )}
        </div>

        {/* Weight Input Bar (Shows when KG product selected) */}
        {selectedProduct && (
          <div className="bg-emerald-950 text-white p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-10 animate-in slide-in-from-bottom-10 fade-in">
             <div className="flex-1">
                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Produto Selecionado</p>
                <h3 className="text-3xl font-black">{selectedProduct.name}</h3>
                <p className="text-emerald-400/60 text-sm font-medium mt-1">Preço/Kg: R$ {selectedProduct.pricePerUnit.toFixed(2)}</p>
             </div>
             <div className="flex items-end gap-4">
                <div>
                   <label className="block text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1 ml-2">Peso (KG)</label>
                   <input 
                      type="number" 
                      placeholder="0.000" 
                      className="w-48 px-6 py-5 rounded-3xl bg-white text-emerald-950 font-black text-center text-4xl outline-none" 
                      value={weightInput} 
                      onChange={e => setWeightInput(e.target.value)} 
                      autoFocus 
                      onKeyDown={e => e.key === 'Enter' && addToCart()} 
                   />
                </div>
                <button onClick={addToCart} className="bg-emerald-500 text-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg hover:bg-emerald-400 transition-all"><i className="fa-plus text-2xl"></i></button>
             </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Cart & Checkout */}
      <div className="lg:col-span-4 bg-white rounded-[2.5rem] shadow-2xl border border-stone-200/50 flex flex-col overflow-hidden">
        
        {/* 1. Customer Identification Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50/30 relative z-20">
            {!selectedCustomer ? (
                <div className="relative">
                   <i className="fa-user-magnifying-glass absolute left-4 top-4 text-stone-400"></i>
                   <input 
                      ref={customerInputRef}
                      type="text"
                      placeholder="Identificar Cliente (Opcional)"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                      value={customerSearch}
                      onChange={e => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                   />
                   {/* Dropdown Results */}
                   {showCustomerDropdown && customerSearch.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 max-h-48 overflow-y-auto z-50 animate-in fade-in zoom-in-95">
                          {filteredCustomers.length > 0 ? (
                             filteredCustomers.map(c => (
                                <button key={c.id} onClick={() => selectCustomer(c)} className="w-full text-left p-3 hover:bg-emerald-50 border-b border-stone-50 last:border-0">
                                   <p className="font-bold text-stone-800 text-sm">{c.name}</p>
                                   <p className="text-xs text-stone-400">{c.cpf}</p>
                                </button>
                             ))
                          ) : (
                             <div className="p-4 text-center text-stone-400 text-xs italic">Cliente não encontrado.</div>
                          )}
                      </div>
                   )}
                   {/* Backdrop to close dropdown */}
                   {showCustomerDropdown && (
                     <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowCustomerDropdown(false)}></div>
                   )}
                </div>
            ) : (
                <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-black shadow-sm">
                          {selectedCustomer.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-emerald-900 text-sm leading-none">{selectedCustomer.name}</p>
                          <p className="text-[10px] text-emerald-600 font-medium mt-1">Saldo: {selectedCustomer.points} pts</p>
                       </div>
                    </div>
                    <button onClick={removeCustomer} className="w-8 h-8 rounded-lg bg-white text-emerald-900/40 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                       <i className="fa-times"></i>
                    </button>
                </div>
            )}
        </div>

        {/* 2. Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-stone-50/20">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-2 opacity-50">
                  <i className="fa-basket-shopping text-5xl"></i>
                  <p className="text-sm font-bold">Carrinho Vazio</p>
               </div>
            ) : (
               cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-stone-100 shadow-sm relative group animate-in slide-in-from-right-4">
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 shadow-sm hover:scale-110 transition-all"><i className="fa-times"></i></button>
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{item.name}</p>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wide">
                            {item.quantity.toFixed(3)} {item.unit} x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-black text-emerald-700">R$ {item.total.toFixed(2)}</p>
                  </div>
               ))
            )}
        </div>
        
        {/* 3. Checkout Footer */}
        <div className="p-8 border-t border-stone-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-30">
            
            {/* Sales Channel Selector */}
            <div>
               <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Canal de Venda</label>
               <select 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 font-bold text-stone-800 text-xs outline-none focus:border-emerald-500"
                  value={selectedOrigin}
                  onChange={e => setSelectedOrigin(e.target.value)}
               >
                  {settings.salesChannels.map(channel => (
                     <option key={channel} value={channel}>{channel}</option>
                  ))}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDocType('CUPOM')} className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${docType === 'CUPOM' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100'}`}>Cupom Simples</button>
                <button onClick={() => setDocType('NFE')} className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${docType === 'NFE' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100'}`}>Nota Fiscal (NF-e)</button>
            </div>

            {/* CPF Field for NF Paulista */}
            <div className="relative">
               <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">CPF na Nota / NF Paulista</label>
               <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 font-bold text-stone-800 text-sm outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                  placeholder="000.000.000-00"
                  value={nfCpf}
                  onChange={e => setNfCpf(e.target.value)}
               />
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-2">
                 {(['pix', 'card', 'cash'] as const).map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${paymentMethod === m ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white text-stone-400 border-stone-100 hover:border-emerald-200'}`}>{paymentLabels[m]}</button>
                 ))}
            </div>

            {/* Total & Action */}
            <div className="flex justify-between items-end pt-2">
                <div>
                   <p className="text-stone-400 font-black uppercase text-[10px] tracking-widest">Total a Pagar</p>
                   {settings.loyaltyEnabled && selectedCustomer && (
                     <p className="text-[9px] font-bold text-emerald-500">Ganhe +{pointsToEarn} pts</p>
                   )}
                </div>
                <p className="text-5xl font-black text-stone-900 tracking-tighter">R$ {totalAmount.toFixed(2)}</p>
            </div>
            <button onClick={handleFinishSale} disabled={cart.length === 0} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl uppercase tracking-widest transition-all ${cart.length === 0 ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-2xl hover:-translate-y-1'}`}>
               <i className="fa-check mr-2"></i> Finalizar Venda
            </button>
        </div>
      </div>

      {isProcessingPayment && (
        <div className="fixed inset-0 bg-emerald-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 text-white text-center animate-in fade-in">
            <div>
              <div className="mb-6 relative">
                 {paymentStep === 'processing' ? (
                    <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                 ) : (
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-in zoom-in"><i className="fa-check"></i></div>
                 )}
              </div>
              <h2 className="text-3xl font-black mb-2">{paymentStep === 'processing' ? 'Processando Pagamento...' : 'Venda Aprovada!'}</h2>
              <p className="text-white/50 font-medium">Aguarde a emissão do comprovante.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default POS;
