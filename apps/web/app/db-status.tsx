import { createClient } from "@/lib/supabase/server";

// Dev aid: confirms the app can reach Supabase. Hidden on Vercel production.
export function showDbStatus() {
  return process.env.VERCEL_ENV !== "production";
}

export async function DbStatus() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ping");

  if (error) {
    return <p className="text-sm text-red-600">資料庫連線失敗：{error.message}</p>;
  }
  return (
    <p className="text-sm text-zinc-500">
      資料庫連線正常（{new Date(data).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}）
    </p>
  );
}
