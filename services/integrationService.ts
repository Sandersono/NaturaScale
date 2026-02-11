
import { Sale, Product, StoreSettings, Customer } from '../types';

/**
 * Integration Service (Mock Implementation)
 * 
 * In a real production environment, these calls would be directed to a secure Backend API 
 * (Node.js/Python) which then communicates with the third-party providers using secure credentials.
 * 
 * This file demonstrates the LOGIC, DATA STRUCTURES, and FLOW for each integration.
 */

export const IntegrationService = {

  // --- 1. Mercado Livre & Nuvemshop (Stock Sync) ---
  async syncStock(product: Product, settings: StoreSettings) {
    if (!settings.mercadolivreToken && !settings.nuvemshopToken) return;

    const totalStock = product.currentStock + product.exposedStock;

    // Mercado Livre Sync Logic
    if (settings.mercadolivreToken) {
      const mlPrice = product.channelPrices?.['mercadolivre'] || product.pricePerUnit;
      console.log(`[ML Integration] Syncing SKU ${product.sku} to Mercado Livre...`);
      console.log(`[ML Payload] PUT /items/${product.sku} body: { available_quantity: ${totalStock}, price: ${mlPrice} }`);
      // Mock fetch
      // await fetch(`https://api.mercadolibre.com/items/${product.sku}?access_token=${settings.mercadolivreToken}`, { method: 'PUT', body: JSON.stringify({ available_quantity: totalStock, price: mlPrice }) });
    }

    // Nuvemshop Sync Logic
    if (settings.nuvemshopToken && settings.nuvemshopUserId) {
        const nuvemPrice = product.channelPrices?.['nuvemshop'] || product.pricePerUnit;
        console.log(`[Nuvemshop Integration] Syncing SKU ${product.sku}...`);
        console.log(`[Nuvemshop Payload] PUT /v1/${settings.nuvemshopUserId}/products/${product.sku}/variants body: { stock: ${totalStock}, price: ${nuvemPrice} }`);
        // Mock fetch
        // await fetch(`https://api.nuvemshop.com.br/v1/${settings.nuvemshopUserId}/products/...`, ...);
    }
  },

  // --- 2. Asaas (Payments & Pix) ---
  async createAsaasCharge(sale: Sale, customer: Customer | null, settings: StoreSettings) {
    if (!settings.asaasApiKey || sale.totalAmount <= 0) return;

    console.log(`[Asaas Integration] Creating Payment for Sale #${sale.id}`);
    
    const payload = {
        customer: customer?.id || 'CUS_GUEST',
        billingType: sale.paymentMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
        value: sale.totalAmount,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Venda PDV #${sale.id}`
    };

    console.log(`[Asaas Payload] POST /api/v3/payments`, payload);
    // Mock Response
    return { success: true, paymentId: 'pay_123456', pixQrCode: '00020126580014br.gov.bcb.pix...' };
  },

  // --- 3. WhatsApp (Meta Cloud API) ---
  async sendWhatsAppReceipt(sale: Sale, phone: string, settings: StoreSettings) {
    if (!settings.whatsappToken || !phone) return;

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    console.log(`[WhatsApp Integration] Sending Receipt to ${formattedPhone}`);
    
    const templatePayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
            name: "receipt_notification",
            language: { code: "pt_BR" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: customerName(sale) },
                        { type: "text", text: `R$ ${sale.totalAmount.toFixed(2)}` },
                        { type: "text", text: sale.id }
                    ]
                }
            ]
        }
    };

    console.log(`[WhatsApp Payload] POST /v17.0/${settings.whatsappPhoneNumberId}/messages`, templatePayload);
  },

  // --- 4. iFood (Order Polling) ---
  // This would typically be a webhook or a scheduled job on the server
  async pollIfoodOrders(settings: StoreSettings) {
      if (!settings.ifoodMerchantId) return [];
      
      console.log(`[iFood Integration] Polling events for merchant ${settings.ifoodMerchantId}...`);
      // GET https://merchant-api.ifood.com.br/order/v1.0/events:polling
      
      // Mock result (randomly finding an order 10% of the time)
      if (Math.random() > 0.9) {
          console.log("[iFood] New order found!");
          return [{
              id: `ifood_${Math.random().toString(36).substr(2, 5)}`,
              total: 55.00,
              items: [{ name: 'Açaí 500ml', qty: 1 }]
          }];
      }
      return [];
  },

  // --- 5. Tiny ERP (Fiscal/NFe) ---
  async emitNfeTiny(sale: Sale, settings: StoreSettings) {
      if (!settings.tinyErpToken) return;

      console.log(`[Tiny ERP] Sending Order #${sale.id} for NFe emission.`);
      
      const pedido = {
          pedido: {
              data_pedido: new Date().toLocaleDateString('pt-BR'),
              cliente: {
                  nome: customerName(sale),
                  tipo_pessoa: 'F',
                  cpf_cnpj: '000.000.000-00' // In real app, from Customer object
              },
              itens: sale.items.map(i => ({
                  item: {
                      codigo: i.productId,
                      descricao: i.name,
                      unidade: i.unit,
                      quantidade: i.quantity,
                      valor_unitario: i.price
                  }
              }))
          }
      };

      console.log(`[Tiny ERP Payload] POST /pedido.incluir.php`, pedido);
  }
};

// Helper
function customerName(sale: Sale): string {
    // In a real scenario, we'd lookup the customer name or use 'Consumidor Final'
    return sale.customerId ? "Cliente Cadastrado" : "Consumidor Final";
}
