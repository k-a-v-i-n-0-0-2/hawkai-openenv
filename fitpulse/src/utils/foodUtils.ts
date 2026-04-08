/**
 * Utility to get a consistent image for a food item based on its ID and Name.
 * Returns an Unsplash URL with a deterministic or keyword-based selection from a high-quality pool.
 */

/**
 * Utility to get a consistent REAL image for a food item based on its ID and Name.
 * We use hardcoded, permanent Unsplash Photo IDs (images.unsplash.com) because it is 
 * the most reliable fast-loading CDN available globally. External 'featured/?keyword' 
 * endpoints are deprecated and often fail.
 */

// A heavily expanded, highly accurate mapping of Indian dishes to their best static Unsplash IDs
const INDIAN_FOOD_DB: Record<string, string[]> = {
  idli: ['1589302160847-729a7160ea0f', '1604085792782-b7e6eeea4a29'],
  dosa: ['1668214578181-ce4cbceb1a9e', '1586190848861-99aa4a171e90'],
  sambar: ['1626777685640-dfcd7b7ed30d'],
  biryani: ['1563379926898-05f4525cd5ce', '1631515243349-e0d29cb1f1c7'],
  paneer: ['1631515243349-e0d29cb1f1c7', '1589302160847-729a7160ea0f'],
  chicken_curry: ['1604908176997-125f25cc6f3d', '1598514982205-f36b96d1e8d4'],
  dal: ['1585937421612-70100de8fda2', '1546833999-2818987b1c1e'],
  rajma: ['1626777685640-dfcd7b7ed30d'], // Dal proxy
  chole: ['1585937421612-70100de8fda2'], // Dal proxy
  roti: ['1555126634-ae3cb99709a3', '1603501062638-4f27f0efee99'],
  paratha: ['1603501062638-4f27f0efee99'],
  samosa: ['1601050690597-df0568f70950'],
  pakora: ['1601050690597-df0568f70950'], // Samosa proxy
  pizza: ['1565299624946-b28f40a0ae38'],
  burger: ['1568901346375-23c9450c58cd'],
  salad: ['1512621776951-a57141f2eefd'],
  chicken: ['1627308595229-7830a5b9c6e3'],
  rice: ['1512058564366-18510fd2b15e'],
  curry: ['1565557613262-b0e6ab4838b0'],
  drink: ['1536935338788-846bb9981813', '1513558161293-cdaf765ed2fd'],
  tea: ['1556881286-fc6915169721', '1561336313-0fd5ebb3033f'],
  coffee: ['1497935586351-b67a49e012bf', '1511920170033-f8396924c348'],
  apple: ['1568702846914-96b305d2aaeb'],
  banana: ['1528825871115-3581a5387919'],
  bread: ['1555126634-ae3cb99709a3'],
  milk: ['1550583724-b2692b85b150'],
  meat: ['1606787366850-de6330128bfc'],
  pasta: ['1473093295043-cdd812d0e601'],
  soup: ['1547592180-85f131ea570e']
};

export const getFoodImage = (foodId: string, foodName: string = '', type: 'thumb' | 'hero' = 'thumb') => {
  const nameLower = foodName.toLowerCase();
  
  let matchedImages = null;

  // Search through our reliable Indian food DB
  for (const [key, images] of Object.entries(INDIAN_FOOD_DB)) {
    const rawKey = key.replace('_', ' '); // Handle compound keys like chicken_curry
    if (nameLower.includes(rawKey)) {
      matchedImages = images;
      break;
    }
  }
  
  // IF NO MATCH IS FOUND, RETURN NULL.
  // We don't want to load misleading images for the other 49k database items.
  // Returning null allows the UI to instantly drop to the stylized initials.
  if (!matchedImages) {
    return null; // Signals the UI to use the fallback directly
  }
  
  // Deterministic seed from foodId ensures the item gets the exact same photo each time
  let hash = 0;
  const strId = String(foodId);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const imgId = matchedImages[Math.abs(hash) % matchedImages.length];

  if (type === 'hero') {
    return `https://images.unsplash.com/photo-${imgId}?w=800&h=450&fit=crop&auto=format`;
  }
  return `https://images.unsplash.com/photo-${imgId}?w=120&h=120&fit=crop&auto=format`;
};

/**
 * Fallback image if the main one fails to load completely, or if no reliable photo exists.
 * Uses a stylized placeholder with the food's initials.
 */
export const getFoodPlaceholder = (name: string) => {
  // CRITICAL FIX: Extract only the FIRST TWO LETTERS from the name.
  // The database has long, complex names like "Raw mango drink (Aam panna)". 
  // Passing 40 characters with parentheses into the small ui-avatars API causes a
  // 400 Bad Request crash, which is why your images were failing to load!
  const cleanedTokens = name.replace(/[^a-zA-Z ]/g, '').split(' ').filter(Boolean);
  
  let initials = 'F'; // Default to "F" for Food
  if (cleanedTokens.length >= 2) {
    initials = cleanedTokens[0][0] + cleanedTokens[1][0];
  } else if (cleanedTokens.length === 1) {
    initials = cleanedTokens[0].substring(0, 2);
  }

  return `https://ui-avatars.com/api/?name=${initials.toUpperCase()}&background=1A1B1E&color=FF6B00&bold=true&size=200&font-size=0.4`;
};

