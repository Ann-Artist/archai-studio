import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { 
  Box, 
  Grid3X3, 
  Eye, 
  EyeOff, 
  User, 
  Tag 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewModeControlsProps {
  viewMode: "realistic" | "wireframe";
  onViewModeChange: (mode: "realistic" | "wireframe") => void;
  transparentWalls: boolean;
  onTransparentWallsChange: (transparent: boolean) => void;
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  enableFirstPerson: boolean;
  onEnableFirstPersonChange: (enable: boolean) => void;
}

const ViewModeControls = ({
  viewMode,
  onViewModeChange,
  transparentWalls,
  onTransparentWallsChange,
  showLabels,
  onShowLabelsChange,
  enableFirstPerson,
  onEnableFirstPersonChange,
}: ViewModeControlsProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border shadow-sm">
        {/* View Mode Toggle */}
        <div className="flex items-center border-r border-border pr-1 mr-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "realistic" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => onViewModeChange("realistic")}
              >
                <Box className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Realistic Mode</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "wireframe" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => onViewModeChange("wireframe")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Wireframe Mode</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Transparent Walls Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={transparentWalls}
              onPressedChange={onTransparentWallsChange}
              size="sm"
              className="h-8 px-2"
              aria-label="Toggle transparent walls"
            >
              {transparentWalls ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>{transparentWalls ? "Solid Walls" : "Transparent Walls"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Labels Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={showLabels}
              onPressedChange={onShowLabelsChange}
              size="sm"
              className="h-8 px-2"
              aria-label="Toggle room labels"
            >
              <Tag className="w-4 h-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showLabels ? "Hide Labels" : "Show Labels"}</p>
          </TooltipContent>
        </Tooltip>

        {/* First Person Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={enableFirstPerson}
              onPressedChange={onEnableFirstPersonChange}
              size="sm"
              className="h-8 px-2"
              aria-label="Toggle first-person view"
            >
              <User className="w-4 h-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>{enableFirstPerson ? "Orbit View" : "First-Person View"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ViewModeControls;
