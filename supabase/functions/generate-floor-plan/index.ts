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

// Helper function to wait
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry fetch with exponential backoff for rate limits
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3,
  initialDelay: number = 1000
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
    const { plotSize, rooms, style, additionalNotes, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert plot size to meters for 3D visualization
    const unitMultiplier = plotSize.unit === "feet" ? 0.3048 : 1;
    const plotWidthMeters = plotSize.width * unitMultiplier;
    const plotDepthMeters = plotSize.length * unitMultiplier;

    // Build prompt for room coordinate generation (NO image generation - saves credits)
    const roomsList = rooms.map((room: { name: string; size: string; priority: string }) => 
      `${room.name} (${room.size} size, ${room.priority})`
    ).join(", ");

    console.log("Generating room layout with AI (text-only, no image)...");

    const coordsPrompt = `You are an architectural AI that creates optimal room layouts.

Given the floor plan specifications:
- Plot size: ${plotWidthMeters.toFixed(1)}m x ${plotDepthMeters.toFixed(1)}m
- Rooms: ${roomsList}
- Style: ${style}
${additionalNotes ? `- Additional requirements: ${additionalNotes}` : ""}

Generate 3D room coordinates for a well-designed floor plan. Each room needs:
- name: room name
- width: room width in meters (small=2-3m, medium=3-5m, large=5-7m)
- depth: room depth in meters
- height: always 3 meters
- position: [x, y, z] where y=1.5 (half height), x,z position rooms logically

Design rules:
- Rooms must NOT overlap
- Logical house layout with good traffic flow
- Essential rooms (living, kitchen) central or near entrance
- Bedrooms grouped together, away from noisy areas
- Keep all rooms within plot boundaries (center is [0, 0, 0])

Respond ONLY with a valid JSON array. No explanation.
Example: [{"name":"Living Room","width":6,"depth":5,"height":3,"position":[-3,1.5,0]}]`;

    let roomCoordinates: RoomCoordinates[] = [];

    try {
      // Use gemini-2.5-flash-lite - cheapest model for text-only
      const coordsResponse = await fetchWithRetry(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [{ role: "user", content: coordsPrompt }],
          }),
        },
        3,
        1000
      );

      if (!coordsResponse.ok) {
        const errorText = await coordsResponse.text();
        console.error("AI API error:", coordsResponse.status, errorText);
        
        if (coordsResponse.status === 429) {
          return new Response(JSON.stringify({ error: "API is busy. Please wait and try again." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (coordsResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace Settings." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Fall through to use fallback
      } else {
        const coordsData = await coordsResponse.json();
        const coordsText = coordsData.choices?.[0]?.message?.content || "";
        
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
          console.log("AI generated", roomCoordinates.length, "rooms");
        }
      }
    } catch (parseError) {
      console.error("AI generation failed, using fallback:", parseError);
    }

    // Fallback: algorithmic layout if AI failed
    if (roomCoordinates.length === 0) {
      console.log("Using fallback algorithmic layout");
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

    // Save project to database (no image upload needed - rendered client-side)
    const projectName = `Floor Plan - ${new Date().toLocaleDateString()}`;
    const { data: projectData, error: projectError } = await supabase
      .from("floor_plan_projects")
      .insert({
        user_id: userId,
        name: projectName,
        plot_width: plotWidthMeters,
        plot_depth: plotDepthMeters,
        rooms: roomCoordinates,
        image_url: null, // Image rendered client-side now
        style: style,
        notes: additionalNotes
      })
      .select()
      .single();

    if (projectError) {
      console.error("Failed to save project:", projectError);
    } else {
      console.log("Project saved:", projectData?.id);
    }

    return new Response(JSON.stringify({ 
      projectId: projectData?.id,
      rooms: roomCoordinates,
      plotWidth: plotWidthMeters,
      plotDepth: plotDepthMeters,
      description: `Generated ${roomCoordinates.length} rooms for ${plotWidthMeters.toFixed(1)}m x ${plotDepthMeters.toFixed(1)}m plot`
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
