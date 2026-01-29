import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FurnitureRecommendation, getRoomType, getFurnitureCategoriesForRoom } from "@/types/furniture";
import { toast } from "sonner";

interface GenerateFurnitureParams {
  category: string;
  style: string;
  material: string;
  color: string;
  roomType: string;
  referenceStyle?: string;
}

export function useFurnitureGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Map<string, FurnitureRecommendation[]>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const generateFurnitureImage = useCallback(async (params: GenerateFurnitureParams): Promise<FurnitureRecommendation | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-furniture-image", {
        body: {
          furniture: {
            category: params.category,
            style: params.style,
            material: params.material,
            color: params.color,
            roomType: params.roomType,
          },
          referenceStyle: params.referenceStyle,
        },
      });

      if (error) {
        console.error("Furniture generation error:", error);
        throw new Error(error.message || "Failed to generate furniture");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Generation failed");
      }

      return {
        id: `${params.roomType}-${params.category}-${Date.now()}`,
        imageUrl: data.imageUrl,
        description: data.description,
        metadata: data.metadata,
      };
    } catch (err) {
      console.error("Error generating furniture:", err);
      return null;
    }
  }, []);

  const generateRoomFurniture = useCallback(async (
    roomName: string,
    style: string,
    material: string,
    colorPalette: string[],
    maxItems: number = 3
  ) => {
    const roomType = getRoomType(roomName);
    const categories = getFurnitureCategoriesForRoom(roomType);
    const selectedCategories = categories.slice(0, maxItems);
    
    setIsGenerating(true);
    setError(null);

    const roomRecommendations: FurnitureRecommendation[] = [];
    
    // Create placeholders
    const placeholders = selectedCategories.map((category, idx) => ({
      id: `${roomType}-${category}-placeholder-${idx}`,
      imageUrl: "",
      description: "",
      metadata: {
        category,
        style,
        material,
        color: colorPalette[idx % colorPalette.length] || "#808080",
        dimensions: { width: 0, depth: 0, height: 0, unit: "cm" },
        roomType,
        estimatedPrice: { min: 0, max: 0, currency: "USD" },
      },
      isLoading: true,
    }));

    setRecommendations(prev => new Map(prev).set(roomName, placeholders));

    // Generate furniture images one by one
    for (let i = 0; i < selectedCategories.length; i++) {
      const category = selectedCategories[i];
      const color = colorPalette[i % colorPalette.length] || "#808080";

      try {
        const recommendation = await generateFurnitureImage({
          category,
          style,
          material,
          color,
          roomType,
        });

        if (recommendation) {
          roomRecommendations.push(recommendation);
          
          // Update state progressively
          setRecommendations(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(roomName) || [];
            const updated = current.map((item, idx) => 
              idx === i ? { ...recommendation, isLoading: false } : item
            );
            newMap.set(roomName, updated);
            return newMap;
          });
        }
      } catch (err) {
        console.error(`Failed to generate ${category}:`, err);
        
        // Mark as error
        setRecommendations(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(roomName) || [];
          const updated = current.map((item, idx) => 
            idx === i ? { ...item, isLoading: false, error: "Failed to generate" } : item
          );
          newMap.set(roomName, updated);
          return newMap;
        });
      }
    }

    setIsGenerating(false);
    return roomRecommendations;
  }, [generateFurnitureImage]);

  const generateAllRoomsFurniture = useCallback(async (
    rooms: Array<{ name: string }>,
    style: string,
    material: string,
    colorPalette: string[],
    maxItemsPerRoom: number = 2
  ) => {
    setIsGenerating(true);
    toast.info("Generating realistic furniture recommendations...", { duration: 5000 });

    for (const room of rooms) {
      await generateRoomFurniture(room.name, style, material, colorPalette, maxItemsPerRoom);
    }

    setIsGenerating(false);
    toast.success("Furniture recommendations generated!");
  }, [generateRoomFurniture]);

  const clearRecommendations = useCallback(() => {
    setRecommendations(new Map());
    setError(null);
  }, []);

  return {
    isGenerating,
    recommendations,
    error,
    generateFurnitureImage,
    generateRoomFurniture,
    generateAllRoomsFurniture,
    clearRecommendations,
  };
}
