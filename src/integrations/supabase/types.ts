export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_results: {
        Row: {
          created_at: string | null
          game_type: string
          id: string
          next_result_number: number
          period: string
        }
        Insert: {
          created_at?: string | null
          game_type: string
          id?: string
          next_result_number: number
          period: string
        }
        Update: {
          created_at?: string | null
          game_type?: string
          id?: string
          next_result_number?: number
          period?: string
        }
        Relationships: []
      }
      bets: {
        Row: {
          amount: number
          bet_number: number
          created_at: string | null
          game_type: string
          id: string
          period: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          bet_number: number
          created_at?: string | null
          game_type: string
          id?: string
          period: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          bet_number?: number
          created_at?: string | null
          game_type?: string
          id?: string
          period?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      game_results: {
        Row: {
          created_at: string
          duration: number
          game_type: string
          id: string
          number: number
          period: string
          result_color: string[]
        }
        Insert: {
          created_at?: string
          duration: number
          game_type: string
          id?: string
          number: number
          period: string
          result_color: string[]
        }
        Update: {
          created_at?: string
          duration?: number
          game_type?: string
          id?: string
          number?: number
          period?: string
          result_color?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          mobile: string | null
          updated_at: string | null
          user_code: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          mobile?: string | null
          updated_at?: string | null
          user_code: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          updated_at?: string | null
          user_code?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bets: {
        Row: {
          amount: number
          bet_type: string
          bet_value: string
          created_at: string
          game_mode: string
          game_type: string
          id: string
          payout: number | null
          period: string
          settled: boolean
          user_id: string
          win: boolean | null
        }
        Insert: {
          amount: number
          bet_type: string
          bet_value: string
          created_at?: string
          game_mode: string
          game_type: string
          id?: string
          payout?: number | null
          period: string
          settled?: boolean
          user_id: string
          win?: boolean | null
        }
        Update: {
          amount?: number
          bet_type?: string
          bet_value?: string
          created_at?: string
          game_mode?: string
          game_type?: string
          id?: string
          payout?: number | null
          period?: string
          settled?: boolean
          user_id?: string
          win?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          balance: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          total_bet_amount: number | null
          total_deposit_amount: number | null
          total_withdraw_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          total_bet_amount?: number | null
          total_deposit_amount?: number | null
          total_withdraw_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          total_bet_amount?: number | null
          total_deposit_amount?: number | null
          total_withdraw_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
        Args: {
          p_game_type: string
          p_period: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
