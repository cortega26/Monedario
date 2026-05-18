interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  monedarioAnalytics?: {
    track: (
      eventName: string,
      params?: Record<string, string | number | boolean | undefined>
    ) => void;
  };
  theme?: {
    themeValue: string;
    setPreference: () => void;
    reflectPreference: () => void;
    getTheme: () => string;
    setTheme: (val: string) => void;
  };
}
