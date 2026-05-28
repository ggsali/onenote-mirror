import { useState } from "react";

const TABS = ["Home", "Insert", "Draw", "View"];

export function RibbonTabs() {
  const [active, setActive] = useState("Home");
  return (
    <div className="flex items-end h-7 bg-[#F5F5F5] border-b border-[#D0D0D0] px-3 gap-1">
      {TABS.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 h-7 text-[12px] transition-colors ${
              isActive
                ? "bg-white text-[#1a1a1a] border-b-2 border-[#7B2FBE] -mb-px"
                : "text-[#444] hover:bg-[#EBEBEB]"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
