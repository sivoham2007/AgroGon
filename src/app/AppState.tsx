import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CURRENT_FARM } from "../data/seedData";
import type { Farm, Farmer } from "../types/domain";
import { LANGUAGES, type LanguageCode } from "../i18n/translations";
import { getToken, setToken } from "../services/http/client";
import { httpProfileService } from "../services/http/profileService";

const EMPTY_FARMER: Farmer = {
  id: "",
  farmerCode: "",
  name: "",
  phone: "",
  preferredLanguage: "en",
  state: "",
  district: "",
  village: "",
};

const LANGUAGE_KEY = "agrogon.language";

interface AppStateShape {
  // `farmer` is always a usable object (never null) so the ~35 existing
  // screens that read farmer.name/farmerCode/etc. don't all need null
  // checks. Before a real login it's the seed placeholder; `isAuthenticated`
  // tells you whether it's actually the logged-in user's real data — every
  // authenticated route is wrapped in <RequireAuth> (see App.tsx), which
  // only renders its children once a real farmer has loaded, so in
  // practice any screen reachable after login always has real data here.
  farmer: Farmer;
  authLoading: boolean;
  isAuthenticated: boolean;
  login: (farmer: Farmer, token: string) => void;
  logout: () => void;
  updateFarmer: (farmer: Farmer) => void;
  farm: Farm;
  toast: string | null;
  showToast: (msg: string) => void;
  online: boolean;
  queueCount: number;
  setQueueCount: (n: number | ((prev: number) => number)) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
}

const AppContext = createContext<AppStateShape | null>(null);

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(LANGUAGE_KEY);
  if (saved && LANGUAGES.some((l) => l.code === saved)) {
    return saved as LanguageCode;
  }
  return "en";
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [toast, setToastState] = useState<string | null>(null);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  const [farmer, setFarmer] = useState<Farmer>(EMPTY_FARMER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // On load, if a token is already stored (previous session), fetch the
  // real profile instead of assuming it's still valid — this is what makes
  // "refresh the page and stay logged in, and see your own data" work.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    httpProfileService
      .get()
      .then((f) => {
        setFarmer(f);
        setIsAuthenticated(true);
        if (f.preferredLanguage) {
          setLanguageState(f.preferredLanguage as LanguageCode);
          window.localStorage.setItem(LANGUAGE_KEY, f.preferredLanguage);
        }
      })
      .catch(() => {
        // Token expired/invalid — clear it so the user is sent back to login.
        setToken(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    function goOnline() { setOnline(true); }
    function goOffline() { setOnline(false); }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const login = useCallback((f: Farmer, token: string) => {
    setToken(token);
    setFarmer(f);
    setIsAuthenticated(true);
    if (f.preferredLanguage) {
      setLanguageState(f.preferredLanguage as LanguageCode);
      window.localStorage.setItem(LANGUAGE_KEY, f.preferredLanguage);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setFarmer(EMPTY_FARMER);
    setIsAuthenticated(false);
  }, []);

  const updateFarmer = useCallback((f: Farmer) => setFarmer(f), []);

  const setLanguage = useCallback((l: LanguageCode) => {
    setLanguageState(l);
    window.localStorage.setItem(LANGUAGE_KEY, l);
    // Persist for the logged-in user so it's applied again after login
    // elsewhere/next time, per the "remember language after login" ask.
    // Fire-and-forget: language already changed locally either way.
    if (getToken()) {
      httpProfileService.updateLanguage(l).catch(() => {});
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastState(msg);
    setTimeout(() => setToastState(null), 2600);
  }, []);

  return (
    <AppContext.Provider value={{
      farmer, authLoading, isAuthenticated, login, logout, updateFarmer,
      farm: CURRENT_FARM, toast, showToast,
      online, queueCount, setQueueCount, language, setLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppStateProvider");
  return ctx;
}
