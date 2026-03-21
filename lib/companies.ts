import { Category } from "@/types/company";

export const CATEGORY_COLORS: Record<Category, string> = {
  Sequencing: "#3B82F6",          // blue
  "DNA Synthesis": "#10B981",     // emerald
  "Liquid Biopsy": "#8B5CF6",     // purple
  "AI Drug Discovery": "#F59E0B", // amber
  "China VC": "#EC4899",          // pink
};

export const CATEGORIES: Category[] = [
  "Sequencing",
  "DNA Synthesis",
  "Liquid Biopsy",
  "AI Drug Discovery",
  "China VC",
];
