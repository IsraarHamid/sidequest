"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Back button + title row repeated at the top of most inner screens. */
export function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-center">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="box-border w-[38px] shrink-0 h-[38px] flex flex-row gap-0 justify-center items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-lg"
      >
        <ArrowLeft className="w-[16px] h-[16px] shrink-0" color="#4A3B2E" />
      </button>
      <div className="text-[19px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
        {title}
      </div>
    </div>
  );
}
