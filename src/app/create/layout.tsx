import { Suspense, type ReactNode } from "react";
import { FundReminder } from "@/components/account/FundReminder";
import { Rail } from "@/components/chrome/Rail";
import { PathBootstrap } from "@/components/chrome/PathBootstrap";

/**
 * Wizard inner shell. The global `AppHeader` + modals live in root
 * layout, so this only handles wizard-specific chrome: the left step
 * Rail + scrolling main content area. Height fills whatever the root
 * `<main>` slot gives us (`flex-1` of the viewport minus header).
 */
export default function CreateLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PathBootstrap />
      </Suspense>
      <div className="relative z-[1] max-w-[1440px] mx-auto h-full">
        <div className="grid grid-cols-[264px_1fr] h-full max-[880px]:grid-cols-1">
          <Rail />
          <main className="px-14 pt-[38px] pb-16 overflow-y-auto max-[880px]:px-[22px]">
            <div className="max-w-[1280px] flex flex-col gap-4">
              <FundReminder variant="full" />
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
