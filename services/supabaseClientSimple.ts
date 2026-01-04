import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnjcnvcbfopcjyfweysb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuamN2ZmFwZSI6ImlhdGVyIjoxNzY5OTAyMjYsImV4cCI6MjA4MjU2NjY2Nn0.BcYP_aJEJwRzMEAXSRvfotP6Qn092SEl5oSbqQxZHTY';

export const supabase = createClient(supabaseUrl, supabaseKey);
