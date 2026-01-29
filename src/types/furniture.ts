export interface FurnitureDimensions {
  width: number;
  depth: number;
  height: number;
  unit: string;
}

export interface FurnitureMetadata {
  category: string;
  style: string;
  material: string;
  color: string;
  dimensions: FurnitureDimensions;
  roomType: string;
  estimatedPrice: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface FurnitureRecommendation {
  id: string;
  imageUrl: string;
  description: string;
  metadata: FurnitureMetadata;
  isLoading?: boolean;
  error?: string;
}

export interface RoomFurnitureSet {
  roomName: string;
  roomType: string;
  recommendations: FurnitureRecommendation[];
}

export const FURNITURE_CATEGORIES: Record<string, string[]> = {
  "living room": ["sofa", "armchair", "coffee table", "tv unit", "bookshelf", "rug", "lamp", "plant"],
  "bedroom": ["bed", "nightstand", "wardrobe", "dresser", "lamp", "rug", "armchair"],
  "master bedroom": ["bed", "nightstand", "wardrobe", "dresser", "lamp", "rug", "armchair", "bench"],
  "kitchen": ["dining table", "chair", "bar stool", "kitchen island"],
  "dining room": ["dining table", "chair", "sideboard", "chandelier"],
  "bathroom": ["vanity", "mirror", "storage cabinet", "towel rack"],
  "entrance": ["console table", "mirror", "coat rack", "shoe rack", "bench"],
  "office": ["desk", "office chair", "bookshelf", "lamp", "storage cabinet"],
};

export const DESIGN_STYLES = [
  { id: "modern", name: "Modern", description: "Clean lines, neutral colors, contemporary feel" },
  { id: "minimal", name: "Minimalist", description: "Simple, functional, clutter-free spaces" },
  { id: "luxury", name: "Luxury", description: "Premium materials, rich textures, opulent finishes" },
  { id: "rustic", name: "Rustic", description: "Natural wood, warm earth tones, cozy farmhouse" },
  { id: "scandinavian", name: "Scandinavian", description: "Light woods, functional beauty, hygge comfort" },
  { id: "industrial", name: "Industrial", description: "Raw metal, exposed elements, urban loft" },
  { id: "bohemian", name: "Bohemian", description: "Eclectic patterns, global influences, artistic" },
  { id: "contemporary", name: "Contemporary", description: "Current trends, balanced proportions" },
];

export const MATERIALS = [
  { id: "wood", name: "Wood", colors: ["#8B4513", "#DEB887", "#A0522D", "#D2691E"] },
  { id: "fabric", name: "Fabric", colors: ["#708090", "#2F4F4F", "#BC8F8F", "#F5F5DC"] },
  { id: "leather", name: "Leather", colors: ["#3D2914", "#8B4513", "#D2691E", "#000000"] },
  { id: "metal", name: "Metal", colors: ["#C0C0C0", "#FFD700", "#CD7F32", "#2F4F4F"] },
  { id: "glass", name: "Glass", colors: ["transparent", "#E0FFFF", "#B0C4DE"] },
  { id: "velvet", name: "Velvet", colors: ["#4B0082", "#800020", "#006400", "#191970"] },
  { id: "marble", name: "Marble", colors: ["#FFFFFF", "#F5F5F5", "#2F4F4F", "#DEB887"] },
  { id: "rattan", name: "Rattan", colors: ["#D2B48C", "#DEB887", "#F5DEB3"] },
];

export function getRoomType(roomName: string): string {
  const name = roomName.toLowerCase();
  if (name.includes("living")) return "living room";
  if (name.includes("master bedroom")) return "master bedroom";
  if (name.includes("bedroom")) return "bedroom";
  if (name.includes("kitchen")) return "kitchen";
  if (name.includes("dining")) return "dining room";
  if (name.includes("bathroom")) return "bathroom";
  if (name.includes("entrance") || name.includes("foyer")) return "entrance";
  if (name.includes("office") || name.includes("study")) return "office";
  return "living room";
}

export function getFurnitureCategoriesForRoom(roomType: string): string[] {
  return FURNITURE_CATEGORIES[roomType] || FURNITURE_CATEGORIES["living room"];
}

export function getStyleColors(styleId: string): string[] {
  const styleColors: Record<string, string[]> = {
    modern: ["#1a1a1a", "#ffffff", "#808080", "#4a90d9"],
    minimal: ["#ffffff", "#f5f5f5", "#e0e0e0", "#1a1a1a"],
    luxury: ["#1a1a2e", "#d4af37", "#8b0000", "#4a0080"],
    rustic: ["#8b4513", "#deb887", "#2e8b57", "#d2691e"],
    scandinavian: ["#f5f5f5", "#e8dcc8", "#87ceeb", "#2f4f4f"],
    industrial: ["#374151", "#d97706", "#1f2937", "#9ca3af"],
    bohemian: ["#7c3aed", "#ec4899", "#f59e0b", "#10b981"],
    contemporary: ["#1e293b", "#3b82f6", "#f43f5e", "#22d3ee"],
  };
  return styleColors[styleId] || styleColors.modern;
}
