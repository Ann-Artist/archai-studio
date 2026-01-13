import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plotSize, rooms, style, additionalNotes, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build detailed prompt for floor plan image generation
    const roomsList = rooms.map((room: { name: string; size: string; priority: string }) => 
      `${room.name} (${room.size} size, ${room.priority})`
    ).join(", ");

    const prompt = `Create a professional 2D architectural floor plan blueprint image. 
    
Specifications:
- Plot size: ${plotSize.width} x ${plotSize.length} ${plotSize.unit}
- Rooms: ${roomsList}
- Style: ${style}
${additionalNotes ? `- Additional requirements: ${additionalNotes}` : ""}

The floor plan should:
- Be a clean, professional top-down 2D architectural blueprint
- Show room layouts with walls, doors, and windows clearly marked
- Include room labels with dimensions
- Use a blue/white blueprint color scheme
- Show furniture placement suggestions
- Include a scale indicator
- Look like a professional architect's floor plan drawing`;

    console.log("Generating floor plan image with prompt:", prompt);

    // Use Gemini image generation model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: prompt }
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate floor plan image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract image from response
    const message = data.choices?.[0]?.message;
    const imageData = message?.images?.[0]?.image_url?.url;
    const textContent = message?.content || "";

    if (!imageData) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "No image generated. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract base64 data from data URL
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      console.error("Invalid image data format");
      return new Response(JSON.stringify({ error: "Invalid image format received" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageType = base64Match[1];
    const base64Data = base64Match[2];
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}-floor-plan.${imageType}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("floor-plans")
      .upload(fileName, bytes, {
        contentType: `image/${imageType}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to save floor plan image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("floor-plans")
      .getPublicUrl(fileName);

    console.log("Floor plan saved:", publicUrlData.publicUrl);

    return new Response(JSON.stringify({ 
      imageUrl: publicUrlData.publicUrl,
      description: textContent,
      fileName: fileName
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-floor-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
