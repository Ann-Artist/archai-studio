import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X, Sparkles, Loader2, Home, Maximize2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  size: "small" | "medium" | "large";
  priority: "essential" | "preferred" | "optional";
}

interface PlotSize {
  width: number;
  length: number;
  unit: "feet" | "meters";
}

const STYLE_OPTIONS = [
  { value: "modern-minimalist", label: "Modern Minimalist" },
  { value: "traditional", label: "Traditional" },
  { value: "contemporary", label: "Contemporary" },
  { value: "industrial", label: "Industrial Loft" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "scandinavian", label: "Scandinavian" },
  { value: "open-concept", label: "Open Concept" },
  { value: "colonial", label: "Colonial" },
];

const ROOM_PRESETS = [
  "Living Room", "Master Bedroom", "Bedroom", "Kitchen", "Bathroom", 
  "Dining Room", "Home Office", "Garage", "Laundry Room", "Pantry"
];

export default function FloorPlanGenerator() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [plotSize, setPlotSize] = useState<PlotSize>({ width: 40, length: 60, unit: "feet" });
  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", name: "Living Room", size: "large", priority: "essential" },
    { id: "2", name: "Master Bedroom", size: "large", priority: "essential" },
    { id: "3", name: "Kitchen", size: "medium", priority: "essential" },
  ]);
  const [style, setStyle] = useState("modern-minimalist");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const addRoom = () => {
    if (!newRoomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    const newRoom: Room = {
      id: Date.now().toString(),
      name: newRoomName.trim(),
      size: "medium",
      priority: "preferred",
    };
    setRooms([...rooms, newRoom]);
    setNewRoomName("");
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };

  const updateRoom = (id: string, field: keyof Room, value: string) => {
    setRooms(rooms.map((room) => (room.id === id ? { ...room, [field]: value } : room)));
  };

  const generateFloorPlan = async () => {
    if (rooms.length === 0) {
      toast.error("Please add at least one room");
      return;
    }

    setIsGenerating(true);
    setGeneratedPlan("");

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-floor-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          plotSize,
          rooms: rooms.map(({ name, size, priority }) => ({ name, size, priority })),
          style: STYLE_OPTIONS.find((s) => s.value === style)?.label || style,
          additionalNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate floor plan");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setGeneratedPlan(fullContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      toast.success("Floor plan generated successfully!");
    } catch (error) {
      console.error("Error generating floor plan:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate floor plan");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blueprint/10">
                <Home className="h-6 w-6 text-blueprint" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                AI Floor Plan Generator
              </h1>
            </div>
            <p className="text-muted-foreground">
              Enter your specifications and let AI create optimized floor plan layouts for your project.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              {/* Plot Size */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Maximize2 className="h-5 w-5 text-accent" />
                    Plot Size
                  </CardTitle>
                  <CardDescription>Define the total area for your floor plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={plotSize.width}
                        onChange={(e) => setPlotSize({ ...plotSize, width: Number(e.target.value) })}
                        min={10}
                        max={500}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        value={plotSize.length}
                        onChange={(e) => setPlotSize({ ...plotSize, length: Number(e.target.value) })}
                        min={10}
                        max={500}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={plotSize.unit}
                        onValueChange={(value: "feet" | "meters") => setPlotSize({ ...plotSize, unit: value })}
                      >
                        <SelectTrigger id="unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feet">Feet</SelectItem>
                          <SelectItem value="meters">Meters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Total Area: {(plotSize.width * plotSize.length).toLocaleString()} sq {plotSize.unit}
                  </p>
                </CardContent>
              </Card>

              {/* Rooms */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Rooms</CardTitle>
                  <CardDescription>Add and configure the rooms you need</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room List */}
                  <div className="space-y-3">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <span className="flex-1 font-medium text-sm">{room.name}</span>
                        <Select
                          value={room.size}
                          onValueChange={(value) => updateRoom(room.id, "size", value)}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={room.priority}
                          onValueChange={(value) => updateRoom(room.id, "priority", value)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="essential">Essential</SelectItem>
                            <SelectItem value="preferred">Preferred</SelectItem>
                            <SelectItem value="optional">Optional</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRoom(room.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add Room */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Add a room..."
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRoom()}
                        list="room-presets"
                      />
                      <datalist id="room-presets">
                        {ROOM_PRESETS.map((preset) => (
                          <option key={preset} value={preset} />
                        ))}
                      </datalist>
                    </div>
                    <Button variant="outline" size="icon" onClick={addRoom}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Style */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Style Preference</CardTitle>
                  <CardDescription>Choose the architectural style for your floor plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                  <CardDescription>Any specific requirements or preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="E.g., Need wheelchair accessibility, prefer natural lighting, want an open kitchen..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                className="w-full h-12 text-lg font-semibold bg-blueprint-gradient hover:opacity-90 transition-opacity"
                onClick={generateFloorPlan}
                disabled={isGenerating || rooms.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Floor Plan
                  </>
                )}
              </Button>
            </div>

            {/* Output */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="glass-card min-h-[600px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Floor Plan</CardTitle>
                    {generatedPlan && (
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {isGenerating
                      ? "AI is designing your floor plan..."
                      : generatedPlan
                      ? "Your floor plan is ready"
                      : "Fill in the form and click generate"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGenerating && !generatedPlan && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Loader2 className="h-12 w-12 animate-spin text-blueprint mb-4" />
                      <p>Analyzing specifications...</p>
                    </div>
                  )}
                  
                  {generatedPlan ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                        {generatedPlan}
                      </pre>
                    </div>
                  ) : !isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <div className="p-4 rounded-full bg-muted/50 mb-4">
                        <Home className="h-12 w-12" />
                      </div>
                      <p className="text-center">
                        Your AI-generated floor plan will appear here
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
