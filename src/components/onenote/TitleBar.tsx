export function TitleBar() {
  return (
    <div className="relative flex items-center h-7 px-3 bg-[#2a2a2a] border-b border-[#111] select-none">
      <div className="flex gap-2">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#888] pointer-events-none">
        OneNote
      </div>
    </div>
  );
}
