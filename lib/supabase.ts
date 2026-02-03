import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone_number: string
          user_type: "customer" | "mechanic" | "talyer_owner" | "admin" | "super_admin"
          status: string
          created_at: string
          updated_at: string
        }
      }
      service_requests: {
        Row: {
          id: string
          customer_id: string
          provider_id: string | null
          title: string
          description: string | null
          status: string
          pickup_latitude: number
          pickup_longitude: number
          estimated_price: number | null
          final_price: number | null
          created_at: string
          updated_at: string
        }
      }
      payment_releases: {
        Row: {
          id: string
          payment_id: string
          provider_id: string
          total_amount: number
          platform_fee: number
          provider_amount: number
          release_status: string
          created_at: string
        }
      }
      talyer_owner_verifications: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_permit_url: string
          valid_id_url: string
          profile_image_url: string | null
          id_type: string
          permit_expiry_date: string | null
          id_expiry_date: string | null
          status: string
          admin_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
          business_address: string | null
          contact_person: string | null
          phone_number: string | null
          email: string | null
          is_permit_expired: boolean
          is_id_expired: boolean
          tamper_flags: any[]
          verification_score: number
        }
      }
    }
  }
}
