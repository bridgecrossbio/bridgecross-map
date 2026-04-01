export type Category =
  | "Sequencing"
  | "DNA Synthesis"
  | "Liquid Biopsy"
  | "AI Drug Discovery"
  | "China VC";

export interface Company {
  id: string;
  name: string;
  name_chinese: string | null;
  category: Category;
  sub_category: string | null;
  founded: number | null;
  city: string;
  province: string | null;
  lat: number;
  lng: number;
  funding_total: string | null;
  funding_stage: string | null;
  website: string | null;
  description: string | null;
  key_products: string | null;
  technology_type: string | null;
  employees_range: string | null;
  listed: boolean | null;
  logo_url: string | null;
  slug: string | null;
  analysis: string | null;
  contact_name: string | null;
  contact_title: string | null;
  contact_email: string | null;
  contact_linkedin: string | null;
}
