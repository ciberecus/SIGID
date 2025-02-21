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
      afiliados: {
        Row: {
          apellido_materno: string
          apellido_paterno: string
          categoria: Database["public"]["Enums"]["categoria_type"]
          clave_elector: string
          created_at: string
          created_by: string | null
          curp: string
          direccion: string
          fecha_nacimiento: string
          fotografia: string | null
          id: number
          nombre: string
          partido_politico_id: number | null
          promotor_id: string | null
          seccion_id: number
          telefono: string | null
          ubicacion_gps: string | null
          updated_at: string
        }
        Insert: {
          apellido_materno: string
          apellido_paterno: string
          categoria: Database["public"]["Enums"]["categoria_type"]
          clave_elector: string
          created_at?: string
          created_by?: string | null
          curp: string
          direccion: string
          fecha_nacimiento: string
          fotografia?: string | null
          id?: never
          nombre: string
          partido_politico_id?: number | null
          promotor_id?: string | null
          seccion_id: number
          telefono?: string | null
          ubicacion_gps?: string | null
          updated_at?: string
        }
        Update: {
          apellido_materno?: string
          apellido_paterno?: string
          categoria?: Database["public"]["Enums"]["categoria_type"]
          clave_elector?: string
          created_at?: string
          created_by?: string | null
          curp?: string
          direccion?: string
          fecha_nacimiento?: string
          fotografia?: string | null
          id?: never
          nombre?: string
          partido_politico_id?: number | null
          promotor_id?: string | null
          seccion_id?: number
          telefono?: string | null
          ubicacion_gps?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "afiliados_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliados_partido_politico_id_fkey"
            columns: ["partido_politico_id"]
            isOneToOne: false
            referencedRelation: "partidos_politicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliados_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliados_seccion_id_fkey"
            columns: ["seccion_id"]
            isOneToOne: false
            referencedRelation: "secciones"
            referencedColumns: ["id"]
          },
        ]
      }
      asignaciones: {
        Row: {
          created_at: string
          id: number
          limite_afiliados: number | null
          promotor_id: string
          seccion_id: number
          supervisor_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          limite_afiliados?: number | null
          promotor_id: string
          seccion_id: number
          supervisor_id: string
        }
        Update: {
          created_at?: string
          id?: never
          limite_afiliados?: number | null
          promotor_id?: string
          seccion_id?: number
          supervisor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignaciones_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignaciones_seccion_id_fkey"
            columns: ["seccion_id"]
            isOneToOne: false
            referencedRelation: "secciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignaciones_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      partidos_politicos: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: never
          nombre: string
        }
        Update: {
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      secciones: {
        Row: {
          id: number
          numero_seccion: number
        }
        Insert: {
          id?: never
          numero_seccion: number
        }
        Update: {
          id?: never
          numero_seccion?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean | null
          email: string
          fotografia: string | null
          id: string
          nombre: string | null
          password: string | null
          rol: Database["public"]["Enums"]["role_type"]
          telefono: string | null
        }
        Insert: {
          activo?: boolean | null
          email: string
          fotografia?: string | null
          id?: string
          nombre?: string | null
          password?: string | null
          rol: Database["public"]["Enums"]["role_type"]
          telefono?: string | null
        }
        Update: {
          activo?: boolean | null
          email?: string
          fotografia?: string | null
          id?: string
          nombre?: string | null
          password?: string | null
          rol?: Database["public"]["Enums"]["role_type"]
          telefono?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          user_id: string
          user_email: string
          user_role: string
        }
        Returns: undefined
      }
      assign_user_role_by_email: {
        Args: {
          user_email: string
          user_role: string
        }
        Returns: undefined
      }
    }
    Enums: {
      categoria_type: "Militante" | "Simpatizante" | "Indeciso" | "Adversario"
      role_type: "Administrador" | "Supervisor" | "Promotor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
