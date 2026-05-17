import Image from "next/image";
import Link from "next/link";

const iosUrl =
  process.env.NEXT_PUBLIC_IOS_APP_URL ?? "https://apps.apple.com/app/load-sa";
const androidUrl =
  process.env.NEXT_PUBLIC_ANDROID_APP_URL ??
  "https://play.google.com/store/apps/details?id=za.loadsa.driver";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-300">Load SA</p>
            <p className="mt-1 text-sm text-slate-500">
              Serving all 9 provinces · Prices in ZAR
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Get the driver app
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={iosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition opacity-90 hover:opacity-100"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/app-store-badge.png"
                  alt="Download on the App Store"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
              <Link
                href={androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition opacity-90 hover:opacity-100"
                aria-label="Get it on Google Play"
              >
                <Image
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Load SA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
