import { Suspense } from "react";
import { DbStatus, showDbStatus } from "./db-status";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold">浮游星 ✦ 人脈書櫃</h1>
      <p className="text-zinc-600">建置中</p>
      {showDbStatus() && (
        <Suspense fallback={<p className="text-sm text-zinc-500">檢查資料庫連線…</p>}>
          <DbStatus />
        </Suspense>
      )}
    </main>
  );
}
