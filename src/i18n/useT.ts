import { useApp } from "../app/AppState";
import { TRANSLATIONS } from "./translations";

export function useT() {
  const { language } = useApp();
  const dict = TRANSLATIONS[language];
  return (key: keyof typeof dict) => dict[key];
}
