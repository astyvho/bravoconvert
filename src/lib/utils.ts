import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge only knows Tailwind's default scales. Without this, our custom radius, shadow and
// font-size tokens (tailwind.config.js) are not recognised as conflicting with the defaults, and
// `text-caption` is mistaken for a text colour and dropped next to `text-foreground`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: ["card", "field", "tile", "tile-sm"] }],
      shadow: [{ shadow: ["soft", "cta"] }],
      "font-size": [{ text: ["display", "h1", "h2", "h3", "caption"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
