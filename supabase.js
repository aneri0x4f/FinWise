// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://qpyitlytjxmyizflgynl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFweWl0bHl0anhteWl6ZmxneW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyODU2NzAsImV4cCI6MjA2MDg2MTY3MH0.FOCicbflgxEeh_VmTx3sUL7hiIfmCZCSBh1wgE5MYZo'
);
window.supabase = supabase;