"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DeletedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("deleted") === "1") {
      setVisible(true);
      // Drop the query param so refreshing/sharing the URL doesn't re-show it.
      router.replace("/");
    }
  }, [searchParams, router]);

  if (!visible) return null;

  return (
    <p className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
      Your account has been deleted.
    </p>
  );
}

export default function AccountDeletedToast() {
  return (
    <Suspense fallback={null}>
      <DeletedToast />
    </Suspense>
  );
}
