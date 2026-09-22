/**
 * Hand-written database types for the Digital Heroes Supabase schema,
 * based on inspection of the live `public` schema (2026-09-21).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  charity_id: string | null;
  charity_percentage: number | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = {
  id: string;
  full_name?: string | null;
  role?: string;
  charity_id?: string | null;
  charity_percentage?: number | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type ProfileUpdate = {
  full_name?: string | null;
  role?: string;
  charity_id?: string | null;
  charity_percentage?: number | null;
  email?: string | null;
  updated_at?: string;
};

export type CharityRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  events: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}
export type CharityInsert = {
  id?: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  events?: string | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
};
export type CharityUpdate = {
  name?: string;
  description?: string | null;
  image_url?: string | null;
  events?: string | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  updated_at?: string;
};


export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string | null;
  status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
export type SubscriptionInsert = {
  id?: string;
  user_id: string;
  plan?: string | null;
  status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type SubscriptionUpdate = {
  plan?: string | null;
  status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  updated_at?: string;
};

export type ScoreRow = {
  id: string;
  user_id: string;
  score: number | null;
  score_date: string | null;
  created_at: string;
  updated_at: string;
}
export type ScoreInsert = {
  id?: string;
  user_id: string;
  score?: number | null;
  score_date?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type ScoreUpdate = {
  score?: number | null;
  score_date?: string | null;
  updated_at?: string;
};

export type DrawRow = {
  id: string;
  draw_date: string | null;
  draw_type: string | null;
  status: string | null;
  total_prize_pool: number | null;
  jackpot_amount: number | null;
  number_1: number | null;
  number_2: number | null;
  number_3: number | null;
  number_4: number | null;
  number_5: number | null;
  published_at: string | null;
  created_at: string;
}
export type DrawInsert = {
  id?: string;
  draw_date?: string | null;
  draw_type?: string | null;
  status?: string | null;
  total_prize_pool?: number | null;
  jackpot_amount?: number | null;
  number_1?: number | null;
  number_2?: number | null;
  number_3?: number | null;
  number_4?: number | null;
  number_5?: number | null;
  published_at?: string | null;
  created_at?: string;
};
export type DrawUpdate = {
  draw_date?: string | null;
  draw_type?: string | null;
  status?: string | null;
  total_prize_pool?: number | null;
  jackpot_amount?: number | null;
  number_1?: number | null;
  number_2?: number | null;
  number_3?: number | null;
  number_4?: number | null;
  number_5?: number | null;
  published_at?: string | null;
};

export type DrawEntryRow = {
  id: string;
  draw_id: string;
  user_id: string;
  created_at: string;
}
export type DrawEntryInsert = {
  id?: string;
  draw_id: string;
  user_id: string;
  created_at?: string;
};
export type DrawEntryUpdate = Record<string, never>;

export type WinnerRow = {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: string | null;
  prize_amount: number | null;
  verification_status: string | null;
  proof_url: string | null;
  payout_status: string | null;
  verified_at: string | null;
  paid_at: string | null;
  created_at: string;
}
export type WinnerInsert = {
  id?: string;
  draw_id: string;
  user_id: string;
  match_type?: string | null;
  prize_amount?: number | null;
  verification_status?: string | null;
  proof_url?: string | null;
  payout_status?: string | null;
  verified_at?: string | null;
  paid_at?: string | null;
  created_at?: string;
};
export type WinnerUpdate = {
  match_type?: string | null;
  prize_amount?: number | null;
  verification_status?: string | null;
  proof_url?: string | null;
  payout_status?: string | null;
  verified_at?: string | null;
  paid_at?: string | null;
};

export type PaymentRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  payment_type: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  stripe_payment_id: string | null;
  created_at: string;
}
export type PaymentInsert = {
  id?: string;
  user_id: string;
  subscription_id?: string | null;
  payment_type?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  stripe_payment_id?: string | null;
  created_at?: string;
};
export type PaymentUpdate = {
  subscription_id?: string | null;
  payment_type?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  stripe_payment_id?: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      charities: {
        Row: CharityRow;
        Insert: CharityInsert;
        Update: CharityUpdate;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
        Relationships: [];
      };
      scores: {
        Row: ScoreRow;
        Insert: ScoreInsert;
        Update: ScoreUpdate;
        Relationships: [];
      };
      draws: {
        Row: DrawRow;
        Insert: DrawInsert;
        Update: DrawUpdate;
        Relationships: [];
      };
      draw_entries: {
        Row: DrawEntryRow;
        Insert: DrawEntryInsert;
        Update: DrawEntryUpdate;
        Relationships: [];
      };
      winners: {
        Row: WinnerRow;
        Insert: WinnerInsert;
        Update: WinnerUpdate;
        Relationships: [];
      };
      payments: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Charity = Database["public"]["Tables"]["charities"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Score = Database["public"]["Tables"]["scores"]["Row"];
export type Draw = Database["public"]["Tables"]["draws"]["Row"];
export type DrawEntry = Database["public"]["Tables"]["draw_entries"]["Row"];
export type Winner = Database["public"]["Tables"]["winners"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
