"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales } from "@/i18n/config";

const languageNames: Record<string, string> = {
  bg: "BG",
  en: "EN",
};

type Locale = (typeof locales)[number];

const LanguageSwitcher: React.FC = () => {
  const defaultLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getCurrentLocale = (): Locale => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const possibleLocale = pathSegments[0];

    if (locales.includes(possibleLocale as Locale)) {
      return possibleLocale as Locale;
    }

    return defaultLocale as Locale;
  };

  const currentLocale = getCurrentLocale();

  const switchLocale = (newLocale: Locale) => {
    const pathSegments = pathname.split("/").filter(Boolean);
    let newPath = pathname;

    if (
      pathSegments.length > 0 &&
      locales.includes(pathSegments[0] as Locale)
    ) {
      newPath = pathname.replace(`/${pathSegments[0]}`, `/${newLocale}`);
    } else {
      newPath = `/${newLocale}${pathname === "/" ? "" : pathname}`;
    }

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
            currentLocale === loc
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
