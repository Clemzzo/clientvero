export type TurnstileAction = "signup" | "login" | "password-reset";

type TurnstileRenderOptions = {
  sitekey: string;
  action: TurnstileAction;
  size?: "normal" | "flexible" | "compact";
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
