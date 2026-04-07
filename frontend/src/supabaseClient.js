import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytzegvhtiojtwpsqjpyc.supabase.co';
const supabaseKey = 'sb_publishable_n1XYDa3U1FUhyOAGoYWb3w_W082OXwT';

export const supabase = createClient(supabaseUrl, supabaseKey);
