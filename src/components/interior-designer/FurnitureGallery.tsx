import { FurnitureRecommendation } from "@/types/furniture";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Ruler, Palette, Box } from "lucide-react";

interface FurnitureCardProps {
  recommendation: FurnitureRecommendation;
  isSelected?: boolean;
  onClick?: () => void;
}

export function FurnitureCard({ recommendation, isSelected, onClick }: FurnitureCardProps) {
  const { metadata, imageUrl, isLoading, error } = recommendation;

  if (isLoading) {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
        <div className="aspect-square relative">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Generating {metadata.category}...</p>
            </div>
          </div>
        </div>
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden opacity-60">
        <div className="aspect-square bg-muted flex items-center justify-center">
          <div className="text-center p-4">
            <Box className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{metadata.category}</p>
            <p className="text-xs text-destructive mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square relative bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={metadata.category}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Box className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Style badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 text-[10px] capitalize"
        >
          {metadata.style}
        </Badge>
      </div>

      {/* Details */}
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-sm capitalize">{metadata.category}</h4>
            <p className="text-xs text-muted-foreground capitalize">{metadata.material}</p>
          </div>
          <div 
            className="w-4 h-4 rounded-full border border-border shadow-sm" 
            style={{ backgroundColor: metadata.color }}
            title={metadata.color}
          />
        </div>

        {/* Dimensions */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Ruler className="w-3 h-3" />
          <span>
            {metadata.dimensions.width} × {metadata.dimensions.depth} × {metadata.dimensions.height} {metadata.dimensions.unit}
          </span>
        </div>

        {/* Price range */}
        <div className="flex items-center gap-1 text-xs">
          <DollarSign className="w-3 h-3 text-green-600" />
          <span className="text-green-600 font-medium">
            ${metadata.estimatedPrice.min} - ${metadata.estimatedPrice.max}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface FurnitureGalleryProps {
  roomName: string;
  recommendations: FurnitureRecommendation[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function FurnitureGallery({ roomName, recommendations, selectedId, onSelect }: FurnitureGalleryProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No furniture recommendations yet</p>
        <p className="text-xs mt-1">Click "Generate Furniture" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <Palette className="w-4 h-4" />
        {roomName}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {recommendations.map((rec) => (
          <FurnitureCard
            key={rec.id}
            recommendation={rec}
            isSelected={selectedId === rec.id}
            onClick={() => onSelect?.(rec.id)}
          />
        ))}
      </div>
    </div>
  );
}
