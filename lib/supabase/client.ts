import { createClient } from '@supabase/supabase-js';

// Supabase client for browser-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types (to be generated later with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          bio: string | null;
          work: string | null;
          hobbies: string | null;
          profile_complete: boolean;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          name: string;
          registration_deadline: string;
          draw_date: string;
          event_date: string;
          status: string;
          participant_count: number;
          matches_generated_at: string | null;
          created_at: string;
        };
      };
      matches: {
        Row: {
          id: string;
          event_id: string;
          giver_id: string;
          receiver_id: string;
          assigned_at: string;
          revealed_at: string | null;
          created_at: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          link: string | null;
          icon: string | null;
          created_at: string;
          display_order: number;
        };
        Insert: Omit<Database['public']['Tables']['wishlist_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['wishlist_items']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          message_text: string;
          image_url: string | null;
          sent_at: string;
          read_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'sent_at'>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string | null;
          message: string | null;
          action_url: string | null;
          read: boolean;
          sent: boolean;
          created_at: string;
          read_at: string | null;
        };
      };
    };
  };
}
