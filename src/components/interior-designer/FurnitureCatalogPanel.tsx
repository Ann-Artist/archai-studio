import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Loader2,
  Sofa,
  Image as ImageIcon,
  Layers
} from "lucide-react";
import { FurnitureGallery } from "./FurnitureGallery";
import { FurnitureRecommendation, DESIGN_STYLES, MATERIALS } from "@/types/furniture";

interface RoomConfig {
  name: string;
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  color: string;
}

interface FurnitureCatalogPanelProps {
  rooms: RoomConfig[];
  designStyle: string;
  colorPalette: string[];
  recommendations: Map<string, FurnitureRecommendation[]>;
  isGenerating: boolean;
  showFurniture: boolean;
  onStyleChange: (style: string) => void;
  onMaterialChange: (material: string) => void;
  onGenerate: (style: string, material: string) => void;
  onToggleFurniture: () => void;
  onSelectFurniture?: (roomName: string, furnitureId: string) => void;
  selectedMaterial: string;
}

export function FurnitureCatalogPanel({
  rooms,
  designStyle,
  colorPalette,
  recommendations,
  isGenerating,
  showFurniture,
  onStyleChange,
  onMaterialChange,
  onGenerate,
  onToggleFurniture,
  onSelectFurniture,
  selectedMaterial,
}: FurnitureCatalogPanelProps) {
  const [activeRoom, setActiveRoom] = useState<string>(rooms[0]?.name || "");
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  const totalRecommendations = Array.from(recommendations.values()).reduce(
    (acc, recs) => acc + recs.filter(r => r.imageUrl && !r.error).length, 
    0
  );

  const handleSelectFurniture = (roomName: string, furnitureId: string) => {
    setSelectedFurnitureId(furnitureId);
    onSelectFurniture?.(roomName, furnitureId);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sofa className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-medium">Furniture Catalog</CardTitle>
          </div>
          {totalRecommendations > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalRecommendations} items
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          AI-generated realistic furniture recommendations
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="p-4 border-b border-border space-y-3">
          {/* Style selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Design Style</label>
            <Select value={designStyle} onValueChange={onStyleChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DESIGN_STYLES.map((style) => (
                  <SelectItem key={style.id} value={style.id} className="text-xs">
                    <div>
                      <span className="font-medium">{style.name}</span>
                      <span className="text-muted-foreground ml-2">- {style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Material selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Primary Material</label>
            <Select value={selectedMaterial} onValueChange={onMaterialChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIALS.map((mat) => (
                  <SelectItem key={mat.id} value={mat.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {mat.colors.slice(0, 3).map((c, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3 rounded-full border border-border" 
                            style={{ backgroundColor: c === "transparent" ? "#fff" : c }}
                          />
                        ))}
                      </div>
                      <span>{mat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color palette preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Color Palette</label>
            <div className="flex gap-1.5">
              {colorPalette.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-md border border-border shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 h-8 text-xs gap-1.5"
              onClick={() => onGenerate(designStyle, selectedMaterial)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Furniture
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={onToggleFurniture}
            >
              {showFurniture ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Show
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Room tabs and furniture gallery */}
        <div className="flex-1 overflow-hidden">
          <Tabs 
            value={activeRoom} 
            onValueChange={setActiveRoom}
            className="h-full flex flex-col"
          >
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 h-auto py-2 gap-1 flex-wrap">
              {rooms.map((room) => (
                <TabsTrigger 
                  key={room.name}
                  value={room.name}
                  className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 py-1 h-auto rounded-md"
                >
                  {room.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="flex-1">
              {rooms.map((room) => (
                <TabsContent 
                  key={room.name} 
                  value={room.name}
                  className="m-0 p-4"
                >
                  <FurnitureGallery
                    roomName={room.name}
                    recommendations={recommendations.get(room.name) || []}
                    selectedId={selectedFurnitureId || undefined}
                    onSelect={(id) => handleSelectFurniture(room.name, id)}
                  />
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
