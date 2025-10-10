import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ekkgajtlxumwbuvenrls.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra2dhanRseHVtd2J1dmVucmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTQ0NzUsImV4cCI6MjA3NTYzMDQ3NX0.bYwDmgTodlV1hh05adyjv-jsZzOA1IbKQ70vvVdeIVM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
