export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      borrow_requests: {
        Row: {
          actual_return_date: string | null
          borrower_id: string
          condition_on_return: string | null
          created_at: string
          end_date: string
          id: string
          item_id: string
          owner_response: string | null
          request_message: string | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_return_date?: string | null
          borrower_id: string
          condition_on_return?: string | null
          created_at?: string
          end_date: string
          id?: string
          item_id: string
          owner_response?: string | null
          request_message?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_return_date?: string | null
          borrower_id?: string
          condition_on_return?: string | null
          created_at?: string
          end_date?: string
          id?: string
          item_id?: string
          owner_response?: string | null
          request_message?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrow_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          participant_one: string
          participant_two: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          participant_one: string
          participant_two: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          participant_one?: string
          participant_two?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category_id: string | null
          condition: string | null
          created_at: string
          deposit_amount: number | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_verified: boolean | null
          listing_type: string
          location: string | null
          max_borrow_days: number | null
          owner_id: string
          price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          condition?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          listing_type?: string
          location?: string | null
          max_borrow_days?: number | null
          owner_id: string
          price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          condition?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_verified?: boolean | null
          listing_type?: string
          location?: string | null
          max_borrow_days?: number | null
          owner_id?: string
          price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          is_verified: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          id: string
          item_id: string
          seller_id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string
          id?: string
          item_id: string
          seller_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          id?: string
          item_id?: string
          seller_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "member"],
    },
  },
} as const
