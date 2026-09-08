import { createClient } from "@supabase/supabase-js";

// Production credentials for the BharatPOS Supabase instance in Mumbai (ap-south-1)
const DEFAULT_SUPABASE_URL = "https://bfcrzaamftvxailhltlb.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_KCTP-Gfx_HBgJglqzRrtqQ_Ea1n1hyZ";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
