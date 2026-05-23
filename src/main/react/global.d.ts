export {};

declare global {
  interface Window {
    showToast: (message: string, type?: string, duration?: number) => void;
    confirmCustom: (message: string) => Promise<boolean>;
    grecaptcha: {
      getResponse: () => string;
    };
  }
}
