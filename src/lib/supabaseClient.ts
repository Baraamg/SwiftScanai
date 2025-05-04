
import { createClient } from "@supabase/supabase-js";

// Public Supabase URL and anon key
const supabaseUrl = "https://brisctuamdsbuyognkto.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaXNjdHVhbWRzYnV5b2dua3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTM5OTksImV4cCI6MjA2MDMyOTk5OX0.MqlISY1NhrOUNVYvVK3hrYqUcyjxmulPuVONyNxkskc";

// Create the Supabase client for client-side usage
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
