import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RoomCoordinates {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

// Colors for different room types
const ROOM_COLORS: Record<string, string> = {
  "living room": "#93c5fd",
  "kitchen": "#fcd34d",
  "master bedroom": "#a5b4fc",
  "bedroom": "#c4b5fd",
  "bathroom": "#67e8f9",
  "entrance": "#86efac",
  "dining room": "#fca5a5",
  "home office": "#d8b4fe",
  "garage": "#9ca3af",
  "laundry room": "#a5f3fc",
  "pantry": "#fdba74",
  "default": "#cbd5e1"
};

function getRoomColor(roomName: string): string {
  const lowerName = roomName.toLowerCase();
  for (const [key, color] of Object.entries(ROOM_COLORS)) {
    if (lowerName.includes(key)) return color;
  }
  return ROOM_COLORS.default;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plotSize, rooms, style, additionalNotes, userId } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert plot size to meters for 3D visualization
    const unitMultiplier = plotSize.unit === "feet" ? 0.3048 : 1;
    const plotWidthMeters = plotSize.width * unitMultiplier;
    const plotDepthMeters = plotSize.length * unitMultiplier;

    // Build detailed prompt for floor plan image generation
    const roomsList = rooms.map((room: { name: string; size: string; priority: string }) => 
      `${room.name} (${room.size} size, ${room.priority})`
    ).join(", ");

    const imagePrompt = `Create a professional 2D architectural floor plan blueprint image. 
    
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

    console.log("Generating floor plan image...");

    // Generate floor plan image using Gemini API directly
    const imageResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await imageResponse.text();
      console.error("Gemini API error:", imageResponse.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate floor plan image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageData = await imageResponse.json();
    console.log("Gemini image response received");

    // Extract image from Gemini response format
    const parts = imageData.candidates?.[0]?.content?.parts || [];
    let imageUrl = "";
    let textContent = "";
    
    for (const part of parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        textContent = part.text;
      }
    }

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(imageData));
      return new Response(JSON.stringify({ error: "No image generated. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Now generate room coordinates using AI
    const coordsPrompt = `You are an architectural AI that converts room specifications into 3D coordinates for visualization.

Given the following floor plan specifications:
- Plot size: ${plotWidthMeters.toFixed(1)}m x ${plotDepthMeters.toFixed(1)}m
- Rooms: ${JSON.stringify(rooms)}

Generate realistic 3D room coordinates that would represent a well-designed floor plan. Each room needs:
- name: room name
- width: room width in meters (based on size: small=2-3m, medium=3-5m, large=5-7m)
- depth: room depth in meters (similar to width)
- height: always 3 meters
- position: [x, y, z] where y is always height/2 (1.5), and x,z should position rooms logically without overlapping

Important:
- Rooms should not overlap
- Rooms should be arranged in a logical house layout
- Essential rooms (like living room, kitchen) should be central
- Bedrooms should be grouped together
- Keep all rooms within the plot boundaries
- The center of the plot is at coordinates [0, 0, 0]

Respond ONLY with a valid JSON array of room objects. No explanation, just the JSON array.
Example format:
[{"name":"Living Room","width":6,"depth":5,"height":3,"position":[-3,1.5,0]},{"name":"Kitchen","width":4,"depth":4,"height":3,"position":[3,1.5,-2]}]`;

    const coordsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: coordsPrompt }] }],
        }),
      }
    );

    let roomCoordinates: RoomCoordinates[] = [];

    if (coordsResponse.ok) {
      const coordsData = await coordsResponse.json();
      const coordsText = coordsData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = coordsText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedRooms = JSON.parse(jsonMatch[0]);
          roomCoordinates = parsedRooms.map((room: any) => ({
            name: room.name,
            width: room.width || 4,
            depth: room.depth || 4,
            height: room.height || 3,
            position: room.position || [0, 1.5, 0],
            color: getRoomColor(room.name)
          }));
          console.log("Generated room coordinates:", roomCoordinates.length, "rooms");
        }
      } catch (parseError) {
        console.error("Failed to parse room coordinates:", parseError);
      }
    }

    // Fallback: generate simple coordinates if AI failed
    if (roomCoordinates.length === 0) {
      console.log("Using fallback room coordinate generation");
      const gridSize = Math.ceil(Math.sqrt(rooms.length));
      const cellWidth = plotWidthMeters / gridSize;
      const cellDepth = plotDepthMeters / gridSize;
      
      roomCoordinates = rooms.map((room: { name: string; size: string }, index: number) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const sizeMultiplier = room.size === "large" ? 0.9 : room.size === "medium" ? 0.7 : 0.5;
        
        return {
          name: room.name,
          width: cellWidth * sizeMultiplier,
          depth: cellDepth * sizeMultiplier,
          height: 3,
          position: [
            (col - gridSize / 2 + 0.5) * cellWidth,
            1.5,
            (row - gridSize / 2 + 0.5) * cellDepth
          ] as [number, number, number],
          color: getRoomColor(room.name)
        };
      });
    }

    // Extract and upload image
    const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
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
    const { error: uploadError } = await supabase.storage
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

    console.log("Floor plan image saved:", publicUrlData.publicUrl);

    // Save project to database
    const projectName = `Floor Plan - ${new Date().toLocaleDateString()}`;
    const { data: projectData, error: projectError } = await supabase
      .from("floor_plan_projects")
      .insert({
        user_id: userId,
        name: projectName,
        plot_width: plotWidthMeters,
        plot_depth: plotDepthMeters,
        rooms: roomCoordinates,
        image_url: publicUrlData.publicUrl,
        style: style,
        notes: additionalNotes
      })
      .select()
      .single();

    if (projectError) {
      console.error("Failed to save project:", projectError);
      // Don't fail the request, just log the error
    } else {
      console.log("Project saved with ID:", projectData?.id);
    }

    return new Response(JSON.stringify({ 
      imageUrl: publicUrlData.publicUrl,
      description: textContent,
      fileName: fileName,
      projectId: projectData?.id,
      rooms: roomCoordinates,
      plotWidth: plotWidthMeters,
      plotDepth: plotDepthMeters
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
