export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      game_periods: {
        Row: {
          created_at: string | null
          end_time: string
          game_mode: string
          game_type: string
          id: number
          is_locked: boolean | null
          period: string
          result: Json | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          game_mode: string
          game_type: string
          id?: number
          is_locked?: boolean | null
          period: string
          result?: Json | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          game_mode?: string
          game_type?: string
          id?: number
          is_locked?: boolean | null
          period?: string
          result?: Json | null
          start_time?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bets: {
        Row: {
          amount: number
          bet_type: string
          bet_value: string
          created_at: string | null
          id: string
          payout: number | null
          period_id: number
          result: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bet_type: string
          bet_value: string
          created_at?: string | null
          id?: string
          payout?: number | null
          period_id: number
          result?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bet_type?: string
          bet_value?: string
          created_at?: string | null
          id?: string
          payout?: number | null
          period_id?: number
          result?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bets_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "game_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          is_admin: boolean | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id: string
          is_admin?: boolean | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_new_period: {
        Args: { p_game_type: string; p_game_mode: string; p_duration: number }
        Returns: number
      }
      generate_and_settle_result: {
        Args: { p_period_id: number }
        Returns: undefined
      }
      generate_period: {
        Args: { game_duration: number }
        Returns: string
      }
      generate_user_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_winning_number: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_game_period: {
        Args: { p_duration: number }
        Returns: {
          period: string
          time_left: number
        }[]
      }
      get_current_period: {
        Args: { p_duration: number }
        Returns: {
          period: string
          time_left: number
        }[]
      }
      get_current_period_info: {
        Args: { p_duration: number }
        Returns: {
          period: string
          time_left: number
        }[]
      }
      get_result_colors: {
        Args: { winning_number: number }
        Returns: string[]
      }
      get_user_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_code: string
          mobile: string
          balance: number
          total_bet_amount: number
          total_deposit_amount: number
          total_withdraw_amount: number
        }[]
      }
      insert_game_result: {
        Args: { p_game_type: string; p_duration: number }
        Returns: {
          period: string
          number: number
          result_color: string[]
        }[]
      }
      place_bet: {
        Args: {
          p_user_id: string
          p_game_type: string
          p_period: string
          p_bet_type: string
          p_bet_value: string
          p_amount: number
        }
        Returns: string
      }
      place_bet_and_deduct: {
        Args: {
          p_user_id: string
          p_amount: number
          p_game_type: string
          p_period: string
          p_bet_number: number
        }
        Returns: undefined
      }
      place_bet_secure: {
        Args:
          | {
              p_game_type: string
              p_period: string
              p_bet_type: string
              p_bet_value: string
              p_amount: number
            }
          | {
              p_period_id: number
              p_bet_type: string
              p_bet_value: string
              p_amount: number
            }
        Returns: undefined
      }
      place_bet_with_wallet: {
        Args: {
          p_game_type: string
          p_game_mode: string
          p_period: string
          p_bet_type: string
          p_bet_value: string
          p_amount: number
        }
        Returns: {
          success: boolean
          message: string
          new_balance: number
        }[]
      }
      place_user_bet: {
        Args: {
          p_user_id: string
          p_game_type: string
          p_game_mode: string
          p_period: string
          p_bet_type: string
          p_bet_value: string
          p_amount: number
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      run_game_round: {
        Args: { p_game_type: string }
        Returns: undefined
      }
      settle_bets_for_result: {
        Args:
          | { p_game_type: string; p_period: string }
          | { p_game_type: string; p_period: string; p_duration: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
