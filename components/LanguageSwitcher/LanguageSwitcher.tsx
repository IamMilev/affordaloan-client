"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales } from "@/i18n/config";

const languageNames: Record<string, string> = {
  bg: "BG",
  en: "EN",
};

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchLocale = (newLocale: string) => {
    // Replace the current locale in the path with the new one
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    // Preserve search params (including step)
    const params = searchParams.toString();
    router.push(params ? `${newPath}?${params}` : newPath);
  };

  return (
    <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={`px-2 py-0.5 rounded-md text-sm font-medium transition-all duration-200 ${
            locale === loc
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {languageNames[loc]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
