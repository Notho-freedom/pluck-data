export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl animate-aurora bg-[radial-gradient(closest-side,oklch(0.84_0.18_155/.35),transparent_70%)]" />
      <div className="absolute top-1/3 -left-32 h-[40rem] w-[40rem] rounded-full opacity-30 blur-3xl animate-float bg-[radial-gradient(closest-side,oklch(0.7_0.18_220/.4),transparent_70%)]" />
      <div className="absolute bottom-0 right-0 h-[44rem] w-[44rem] rounded-full opacity-30 blur-3xl animate-float-slow bg-[radial-gradient(closest-side,oklch(0.78_0.17_175/.35),transparent_70%)]" />
    </div>
  );
}
