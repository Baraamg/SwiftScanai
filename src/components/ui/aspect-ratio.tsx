
import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ZoomOut } from "lucide-react";

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };

interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  isOpen,
  onClose,
  src,
  alt = "Medical scan image"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-background/20 backdrop-blur-sm p-2 rounded-full hover:bg-background/30 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-white" />
        </button>
        <ZoomableImage
          src={src}
          alt={alt}
          maxZoom={6}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

// Enhanced Image Viewer with zoom functionality
export function ZoomableImage({
  src,
  alt,
  className,
  maxZoom = 3,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { maxZoom?: number }) {
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const imageRef = React.useRef<HTMLImageElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  React.useEffect(() => {
    const cleanup = () => {
      setDragging(false);
    };
    
    window.addEventListener("mouseup", cleanup);
    return () => {
      window.removeEventListener("mouseup", cleanup);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg bg-muted" {...props}>
      <div
        className={cn(
          "relative overflow-hidden w-full h-full",
          dragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default",
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt || "Zoomable image"}
          className="w-full h-full object-contain transition-transform duration-100"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transformOrigin: "center center",
          }}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      
      <div className="absolute bottom-3 right-3 flex gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-full shadow-md">
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/40 disabled:opacity-50 transition-colors"
          disabled={zoom <= 1}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/40 transition-colors"
          aria-label="Reset zoom"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/40 disabled:opacity-50 transition-colors"
          disabled={zoom >= maxZoom}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
