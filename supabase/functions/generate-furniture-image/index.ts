import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FurnitureRequest {
  category: string;
  style: string;
  material: string;
  color: string;
  roomType: string;
  dimensions?: { width: number; depth: number; height: number };
}

// Helper function to wait
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry fetch with exponential backoff for rate limits
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 5,
  initialDelay: number = 2000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const waitTime = initialDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await delay(waitTime);
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      const waitTime = initialDelay * Math.pow(2, attempt);
      console.log(`Request failed. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
      await delay(waitTime);
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { furniture, referenceStyle } = await req.json() as { 
      furniture: FurnitureRequest; 
      referenceStyle?: string;
    };

    if (!furniture || !furniture.category) {
      throw new Error("Furniture category is required");
    }

    const styleDescription = getStyleDescription(furniture.style);
    const materialDescription = getMaterialDescription(furniture.material);
    const prompt = buildFurniturePrompt(furniture, styleDescription, materialDescription, referenceStyle);

    console.log("Generating furniture image with retry logic...");

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      },
      5,
      3000
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "API is busy. Please wait and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    let imageUrl = "";
    let description = "";
    
    for (const part of parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        description = part.text;
      }
    }

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    const metadata = generateFurnitureMetadata(furniture);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        description,
        metadata,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Furniture generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getStyleDescription(style: string): string {
  const styles: Record<string, string> = {
    modern: "sleek, clean lines, minimalist aesthetic, contemporary design with subtle elegance",
    minimal: "ultra-simple, understated, functional, Scandinavian-inspired with neutral tones",
    luxury: "opulent, high-end materials, rich textures, sophisticated craftsmanship, premium finishes",
    rustic: "natural wood grain, warm earth tones, farmhouse charm, handcrafted appearance",
    scandinavian: "light wood, clean forms, cozy hygge aesthetic, functional simplicity",
    industrial: "raw metal, exposed elements, urban loft style, vintage factory aesthetic",
    bohemian: "eclectic patterns, rich colors, global influences, artistic and free-spirited",
    contemporary: "current trends, balanced proportions, refined materials, timeless appeal",
  };
  return styles[style?.toLowerCase()] || styles.modern;
}

function getMaterialDescription(material: string): string {
  const materials: Record<string, string> = {
    wood: "natural wood grain, warm finish, solid construction",
    fabric: "high-quality upholstery, soft texture, comfortable cushioning",
    leather: "genuine leather, rich patina, luxurious feel",
    metal: "brushed or polished metal, sturdy frame, industrial accents",
    glass: "tempered glass, crystal clear, modern transparency",
    velvet: "plush velvet upholstery, rich depth, luxurious sheen",
    marble: "natural marble surface, elegant veining, premium stone",
    rattan: "natural woven rattan, tropical feel, lightweight construction",
  };
  return materials[material?.toLowerCase()] || materials.fabric;
}

function buildFurniturePrompt(
  furniture: FurnitureRequest,
  styleDesc: string,
  materialDesc: string,
  referenceStyle?: string
): string {
  const category = furniture.category.toLowerCase();
  const color = furniture.color || "neutral";
  const roomType = furniture.roomType || "living room";
  
  let prompt = `Professional interior design catalog photograph of a ${category}. `;
  prompt += `Style: ${styleDesc}. `;
  prompt += `Material: ${materialDesc}. `;
  prompt += `Color scheme: ${color} tones. `;
  prompt += `Designed for a ${roomType}. `;
  
  if (furniture.dimensions) {
    prompt += `Approximate dimensions: ${furniture.dimensions.width}cm wide, ${furniture.dimensions.depth}cm deep, ${furniture.dimensions.height}cm tall. `;
  }
  
  if (referenceStyle) {
    prompt += `Inspired by: ${referenceStyle}. `;
  }
  
  prompt += `Shot in a bright, well-lit studio environment with soft shadows. `;
  prompt += `High resolution, photorealistic, professional product photography. `;
  prompt += `Clean white or neutral background. `;
  prompt += `The furniture should look like a real purchasable product from a premium furniture store. `;
  prompt += `Ultra high resolution, 4K quality.`;
  
  return prompt;
}

function generateFurnitureMetadata(furniture: FurnitureRequest) {
  const defaultDimensions: Record<string, { width: number; depth: number; height: number }> = {
    sofa: { width: 220, depth: 95, height: 85 },
    bed: { width: 180, depth: 200, height: 45 },
    "dining table": { width: 160, depth: 90, height: 75 },
    chair: { width: 55, depth: 60, height: 85 },
    armchair: { width: 80, depth: 85, height: 90 },
    "coffee table": { width: 120, depth: 60, height: 45 },
    lamp: { width: 40, depth: 40, height: 60 },
    wardrobe: { width: 150, depth: 60, height: 200 },
    desk: { width: 140, depth: 70, height: 75 },
    bookshelf: { width: 100, depth: 35, height: 180 },
    nightstand: { width: 50, depth: 40, height: 55 },
    "tv unit": { width: 180, depth: 45, height: 50 },
    rug: { width: 200, depth: 300, height: 2 },
    plant: { width: 40, depth: 40, height: 100 },
  };

  const dims = furniture.dimensions || defaultDimensions[furniture.category.toLowerCase()] || { width: 100, depth: 80, height: 80 };

  return {
    category: furniture.category,
    style: furniture.style,
    material: furniture.material,
    color: furniture.color,
    dimensions: {
      width: dims.width,
      depth: dims.depth,
      height: dims.height,
      unit: "cm",
    },
    roomType: furniture.roomType,
    estimatedPrice: generatePriceRange(furniture.category, furniture.style),
  };
}

function generatePriceRange(category: string, style: string): { min: number; max: number; currency: string } {
  const basePrices: Record<string, { min: number; max: number }> = {
    sofa: { min: 800, max: 3500 },
    bed: { min: 600, max: 2500 },
    "dining table": { min: 400, max: 2000 },
    chair: { min: 100, max: 600 },
    armchair: { min: 300, max: 1500 },
    "coffee table": { min: 200, max: 1000 },
    lamp: { min: 50, max: 400 },
    wardrobe: { min: 500, max: 2500 },
    desk: { min: 300, max: 1500 },
    bookshelf: { min: 200, max: 1200 },
    nightstand: { min: 100, max: 500 },
    "tv unit": { min: 300, max: 1500 },
    rug: { min: 150, max: 1000 },
    plant: { min: 30, max: 200 },
  };

  const base = basePrices[category.toLowerCase()] || { min: 200, max: 1000 };
  const multiplier = style?.toLowerCase() === "luxury" ? 2 : 1;
  
  return {
    min: Math.round(base.min * multiplier),
    max: Math.round(base.max * multiplier),
    currency: "USD",
  };
}
