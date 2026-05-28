export function TitleBar() {
  return (
    <div className="flex items-center h-7 px-3 bg-[#E8E6E2] border-b border-[#D4D4D4] select-none">
      <div className="flex gap-2">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#DEA123]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
      </div>
      <div className="flex-1 text-center text-[12px] text-[#555] font-medium">
        OneNote
      </div>
    </div>
  );
}
