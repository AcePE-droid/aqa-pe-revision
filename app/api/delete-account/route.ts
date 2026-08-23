import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Deletes the signed-in user's account. Requires the service_role key
// (server-only - see lib/supabase/admin.ts), so this must run here, not in
// a Client Component. The user's own session cookie is used only to verify
// who they are; the actual deletion uses the admin client.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("Delete account: admin client unavailable:", err);
    return NextResponse.json({ error: "Account deletion is not configured" }, { status: 500 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Failed to delete user account:", deleteError);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  // flashcard_progress rows are removed automatically via the table's
  // `on delete cascade` foreign key to auth.users (see the Part 2 migration).
  return NextResponse.json({ success: true });
}
