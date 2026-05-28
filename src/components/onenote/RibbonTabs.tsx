import { useState } from "react";

const TABS = ["Home", "Insert", "Draw", "View", "Tell me..."];

export function RibbonTabs() {
  const [active, setActive] = useState("Home");
  return (
    <div className="flex items-end h-7 bg-[#262626] border-b border-[#111] px-3 gap-1 select-none">
      {TABS.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 h-7 text-[12px] transition-colors ${
              isActive
                ? "text-white bg-[#323232]"
                : "text-[#888] hover:text-[#ccc] hover:bg-[#2c2c2c]"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
