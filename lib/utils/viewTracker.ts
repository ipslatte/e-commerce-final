const VIEW_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const trackProductView = async (productId: string): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const viewKey = `product_view_${productId}`;
  const lastView = localStorage.getItem(viewKey);

  // Check if product was viewed recently
  if (lastView) {
    const timeSinceLastView = now - parseInt(lastView);
    if (timeSinceLastView < VIEW_TIMEOUT) {
      return false; // Skip tracking if viewed recently
    }
  }

  try {
    // Track the view
    const response = await fetch(`/api/products/${productId}/view`, {
      method: "POST",
    });

    if (response.ok) {
      // Store the timestamp of this view
      localStorage.setItem(viewKey, now.toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error tracking product view:", error);
    return false;
  }
};
