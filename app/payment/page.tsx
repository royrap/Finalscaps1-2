import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function PaymentPage() {
  // Example: Fetch payment data from Supabase
  // Replace with your actual table and logic
  // const { data, error } = await supabase.from('payments').select('*');
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>
      <p>Connect and manage your payments with Supabase.</p>
    </div>
  );
}
