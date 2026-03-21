import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, name, name_chinese, category, sub_category, founded, city, province, lat, lng, funding_total, funding_stage, website, description, key_products, technology_type, employees_range, listed"
    );

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
