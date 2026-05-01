export type FavoriteStock = {
  userId: string;
  ticker: string;
  companyName: string;
  industry: string;
  growthRate: number;
  peRatio: number;
  growthOverPe: number;
};

const API_BASE_URL = "http://localhost:5000/api";

export async function addFavoriteStock(stock: FavoriteStock) {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });

  if (!response.ok) {
    throw new Error("Could not save favorite stock");
  }

  return response.json();
}