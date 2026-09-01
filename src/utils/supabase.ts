import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://onelloibflabkubgsioa.supabase.co';
const supabaseAnonKey = 'sb_publishable_1G7-pYW6cb1plR8wvSs0nQ_1u1B9WF8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to clean phone numbers for WhatsApp
export const cleanPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '549' + cleaned;
  } else if (cleaned.startsWith('9')) {
    cleaned = '54' + cleaned;
  } else if (!cleaned.startsWith('54')) {
    cleaned = '549' + cleaned;
  }
  return cleaned;
};
