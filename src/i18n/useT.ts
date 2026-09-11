import { useApp } from "../app/AppState";
import { TRANSLATIONS } from "./translations";

export function useT() {
  const { language } = useApp();
  
  return (key: keyof typeof TRANSLATIONS["en"]) => {
    // 1. Get dictionary for the selected language, fallback to English if the dictionary is missing
    const dict = TRANSLATIONS[language] || TRANSLATIONS["en"];
    
    // 2. Check if the key exists in the current dictionary
    if (dict && typeof dict[key] !== "undefined") {
      return dict[key];
    }
    
    // 3. Fallback to English dictionary if key is missing in the current language
    const enDict = TRANSLATIONS["en"];
    if (enDict && typeof enDict[key] !== "undefined") {
      return enDict[key];
    }
    
    // 4. Absolute fallback: return the key itself instead of crashing
    return key as any;
  };
}
