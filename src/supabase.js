import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://supabase.com/dashboard/project/dbkbhhcppvgqkvvdgoso";
const supabaseUrl = "https://dbkbhhcppvgqkvvdgoso.supabase.co";


const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRia2JoaGNwcHZncWt2dmRnb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTAyOTEsImV4cCI6MjA2NTM4NjI5MX0.H3dk2zzy0noV0uOFIQxLZ5Z1wwB33-4ySMlJ5tl0f7A";

export const supabase = createClient(supabaseUrl, supabaseKey);
