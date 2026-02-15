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
      clients: {
        Row: {
          channel: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          whatsapp: string | null
          workspace_id: string | null
        }
        Insert: {
          channel?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          whatsapp?: string | null
          workspace_id?: string | null
        }
        Update: {
          channel?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          whatsapp?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      config: {
        Row: {
          base_fee: number | null
          energy_per_h: number | null
          fortaleza_discount: number | null
          labor_per_h: number | null
          markup_material: number | null
          min_order_price: number | null
          packaging_default: number | null
          print_price_per_h: number | null
          updated_at: string | null
          updated_by: string | null
          workspace_id: string
        }
        Insert: {
          base_fee?: number | null
          energy_per_h?: number | null
          fortaleza_discount?: number | null
          labor_per_h?: number | null
          markup_material?: number | null
          min_order_price?: number | null
          packaging_default?: number | null
          print_price_per_h?: number | null
          updated_at?: string | null
          updated_by?: string | null
          workspace_id: string
        }
        Update: {
          base_fee?: number | null
          energy_per_h?: number | null
          fortaleza_discount?: number | null
          labor_per_h?: number | null
          markup_material?: number | null
          min_order_price?: number | null
          packaging_default?: number | null
          print_price_per_h?: number | null
          updated_at?: string | null
          updated_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          price_per_kg: number
          workspace_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          price_per_kg: number
          workspace_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          price_per_kg?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          calculated_json: Json | null
          color: string | null
          created_at: string | null
          fixed_price: number | null
          id: string
          material_id: string | null
          order_id: string | null
          other_cost: number | null
          product_id: string | null
          qty: number
          time_h: number | null
          weight_g: number | null
          workspace_id: string | null
        }
        Insert: {
          calculated_json?: Json | null
          color?: string | null
          created_at?: string | null
          fixed_price?: number | null
          id?: string
          material_id?: string | null
          order_id?: string | null
          other_cost?: number | null
          product_id?: string | null
          qty: number
          time_h?: number | null
          weight_g?: number | null
          workspace_id?: string | null
        }
        Update: {
          calculated_json?: Json | null
          color?: string | null
          created_at?: string | null
          fixed_price?: number | null
          id?: string
          material_id?: string | null
          order_id?: string | null
          other_cost?: number | null
          product_id?: string | null
          qty?: number
          time_h?: number | null
          weight_g?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string | null
          client_id: string | null
          created_at: string | null
          delivery_method: string | null
          discount: number | null
          freight: number | null
          id: string
          month_ref: string | null
          notes: string | null
          order_date: string
          payment_method: string | null
          status: string
          totals_json: Json | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          delivery_method?: string | null
          discount?: number | null
          freight?: number | null
          id?: string
          month_ref?: string | null
          notes?: string | null
          order_date: string
          payment_method?: string | null
          status: string
          totals_json?: Json | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          delivery_method?: string | null
          discount?: number | null
          freight?: number | null
          id?: string
          month_ref?: string | null
          notes?: string | null
          order_date?: string
          payment_method?: string | null
          status?: string
          totals_json?: Json | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_time_h: number | null
          avg_weight_g: number | null
          category: string
          created_at: string | null
          default_color: string | null
          default_material_id: string | null
          fixed_price: number | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          workspace_id: string | null
        }
        Insert: {
          avg_time_h?: number | null
          avg_weight_g?: number | null
          category: string
          created_at?: string | null
          default_color?: string | null
          default_material_id?: string | null
          fixed_price?: number | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          workspace_id?: string | null
        }
        Update: {
          avg_time_h?: number | null
          avg_weight_g?: number | null
          category?: string
          created_at?: string | null
          default_color?: string | null
          default_material_id?: string | null
          fixed_price?: number | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_default_material_id_fkey"
            columns: ["default_material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          color: string
          id: string
          material_id: string | null
          min_g: number | null
          qty_g: number | null
          workspace_id: string | null
        }
        Insert: {
          color: string
          id?: string
          material_id?: string | null
          min_g?: number | null
          qty_g?: number | null
          workspace_id?: string | null
        }
        Update: {
          color?: string
          id?: string
          material_id?: string | null
          min_g?: number | null
          qty_g?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          id: string
          material_id: string | null
          qty_delta_g: number
          reason: string | null
          ref_id: string | null
          ref_type: string | null
          workspace_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          material_id?: string | null
          qty_delta_g: number
          reason?: string | null
          ref_id?: string | null
          ref_type?: string | null
          workspace_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          material_id?: string | null
          qty_delta_g?: number
          reason?: string | null
          ref_id?: string | null
          ref_type?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      supplies: {
        Row: {
          created_at: string | null
          id: string
          month_ref: string | null
          name: string
          qty: number | null
          status: string | null
          type: string | null
          value_total: number | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          month_ref?: string | null
          name: string
          qty?: number | null
          status?: string | null
          type?: string | null
          value_total?: number | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          month_ref?: string | null
          name?: string
          qty?: number | null
          status?: string | null
          type?: string | null
          value_total?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_workspace_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ADMIN" | "OPERADOR" | "VISUALIZADOR"
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
      app_role: ["ADMIN", "OPERADOR", "VISUALIZADOR"],
    },
  },
} as const
