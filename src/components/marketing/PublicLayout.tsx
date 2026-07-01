import { MarketingNav } from "./MarketingNav";
import { CorporateFooter } from "@/components/landing/CorporateFooter";
import { LogosBar } from "@/components/landing/LogosBar";

export function PublicLayout({
  children,
  showLogos = true,
}: { children: React.ReactNode; showLogos?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main>{children}</main>
      {showLogos && <LogosBar />}
      <CorporateFooter />
    </div>
  );
}
