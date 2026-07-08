import { useState } from "react";
import { cn } from "@/lib/utils";

interface PropertyHeroGalleryProps {
  images: string[];
  alt: string;
}

export function PropertyHeroGallery({ images, alt }: PropertyHeroGalleryProps) {
  const gallery = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const current = gallery[active] ?? gallery[0];

  if (!current) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black/40">
        <img src={current} alt={alt} className="h-full w-full object-cover" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-accent" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
