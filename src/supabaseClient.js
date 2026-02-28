import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://lhlnjggrljdgmytmoaqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobG5qZ2dybGpkZ215dG1vYXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjUwNjAsImV4cCI6MjA4MzkwMTA2MH0.61TrFDb3XD14y26_aOhMqcrmgORDnrB7OmRdGlABgKI'
);
