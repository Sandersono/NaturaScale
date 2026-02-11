
import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getInventoryInsights(products: Product[]) {
  const lowStock = products.filter(p => p.currentStock <= p.minStockWarehouse || p.exposedStock <= p.minStockStore);
  const prompt = `
    Analise o seguinte estoque de uma loja de produtos naturais:
    ${JSON.stringify(lowStock)}

    Com base nestes itens com estoque baixo, forneça 3 dicas rápidas de negócios ou sugestões de pedidos para o gerente. 
    Considere que vendemos a granel. Seja conciso e use tom profissional em português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights do Gemini:", error);
    return "Não foi possível carregar os insights no momento.";
  }
}

export async function getSalesAnalysis(sales: Sale[]) {
    // Simple analysis of sales volume/patterns
    const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const prompt = `
      Minhas vendas recentes totalizaram R$ ${totalSales.toFixed(2)}. 
      Tenho ${sales.length} transações. 
      Dê um feedback curto sobre o desempenho da loja.
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        return response.text;
      } catch (error) {
        return "Análise de vendas indisponível.";
      }
}
