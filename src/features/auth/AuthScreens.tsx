import { useState, useRef, useCallback, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { PrimaryButton, SecondaryButton, Field } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { BrandLockup } from "../../components/ui/Brand";
import { services } from "../../services";
import { resendOtp } from "../../services/http/authService";
import { ApiError } from "../../services/http/client";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";

function AuthBackdrop({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 bg-[#efefef]">
      <div className={`w-full ${wide ? "max-w-[620px]" : "max-w-[520px]"} rounded-[28px] border border-[#dfe6df] bg-[#f5f5f1] shadow-[0_8px_24px_rgba(18,53,42,0.06)] px-7 py-8 sm:px-8`}>
        {children}
      </div>
    </div>
  );
}

export function LoginScreen() {
  const navigate = useNavigate();
  const t = useT();
  const [phone, setPhone] = useState(() => typeof window !== "undefined" ? window.localStorage.getItem("agrogon.remember_phone") || "" : "");
  const [rememberMe, setRememberMe] = useState(() => typeof window !== "undefined" ? !!window.localStorage.getItem("agrogon.remember_phone") : false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp() {
    if (!phone.trim()) { setError("Enter your mobile number."); return; }
    
    if (typeof window !== "undefined") {
      if (rememberMe) {
        window.localStorage.setItem("agrogon.remember_phone", phone);
      } else {
        window.localStorage.removeItem("agrogon.remember_phone");
      }
    }

    setSending(true);
    setError("");
    try {
      const res = await services.auth.requestOtp(phone);
      navigate("/otp", { state: { phone, purpose: "login", devOtp: (res as { devOtp?: string }).devOtp } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send the OTP. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthBackdrop>
    <div className="flex flex-col gap-4 view-enter">
      <div className="mb-1">
        <BrandLockup badgeSize={50} textSize={19} />
      </div>
      <div className="space-y-2">
        <h1 className="font-[var(--font-head)] font-extrabold text-[30px] leading-none text-[var(--color-dark)]">{t("auth_welcome")}</h1>
        <p className="text-[13px] text-[#5E7568]">{t("auth_loginSubtitle")}</p>
      </div>
      <div className="pt-2">
        <Field label={t("auth_mobileNumber")} type="tel" placeholder="7618795406" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <label className="flex items-center gap-2.5 text-[13px] font-medium text-[#5E7568]">
        <span className="relative inline-flex items-center justify-center">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
          <span className="w-[18px] h-[18px] rounded-[4px] bg-[#E7F4EC] border border-[#2E9D68] flex items-center justify-center transition-colors peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)]">
            <svg viewBox="0 0 24 24" className="hidden peer-checked:block w-[12px] h-[12px] text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.2 4.2L19 2.5" />
            </svg>
          </span>
        </span>
        {t("auth_rememberMe")}
      </label>
      {error && <p className="text-[var(--color-danger)] text-[12.5px] leading-snug">{error}</p>}
      <PrimaryButton disabled={sending} onClick={sendOtp} className="!rounded-[18px] !py-[18px] !text-[18px] !font-extrabold !shadow-none">{sending ? t("common_loading") : t("auth_sendOtp")}</PrimaryButton>
      <SecondaryButton onClick={() => navigate("/register")} className="!rounded-[18px] !py-[18px] !text-[18px] !font-extrabold !bg-transparent !border-[1.5px] !border-[#a4b7ab] !text-[var(--color-dark)]">{t("auth_newFarmer")} {t("auth_createAccount")}</SecondaryButton>
      <div className="text-center pt-1"><a className="text-[var(--color-secondary)] text-[12.5px] font-semibold">{t("auth_needHelp")}</a></div>
    </div>
    </AuthBackdrop>
  );
}

export function OtpScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast } = useApp();
  const t = useT();
  const state = (location.state as { phone?: string; purpose?: "login" | "register"; devOtp?: string } | null) || {};
  const phone = state.phone || "";
  const purpose = state.purpose || "login";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [devOtp, setDevOtp] = useState(state.devOtp);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function verify() {
    const otp = digits.join("");
    if (otp.length !== 6) { setError("Enter the 6-digit code."); return; }
    setVerifying(true);
    setError("");
    try {
      const { token, farmer } = await services.auth.verifyOtp(phone, otp);
      login(farmer, token);
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Invalid code");
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    setResending(true);
    setError("");
    try {
      const res = await resendOtp(phone, purpose);
      setDevOtp(res.devOtp);
      showToast("A new code was sent.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  }

  const handleChange = useCallback((i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (!clean) return;
    // Support paste of full 6-digit code into any box
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      chars.forEach((c, idx) => { next[idx] = c; });
      setDigits(next);
      const lastFilled = Math.min(chars.length - 1, 5);
      inputRefs.current[lastFilled]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean[0];
    setDigits(next);
    if (i < 5) inputRefs.current[i + 1]?.focus();
  }, [digits]);

  const handleKeyDown = useCallback((i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        const next = [...digits];
        next[i - 1] = "";
        setDigits(next);
        inputRefs.current[i - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["", "", "", "", "", ""];
    text.split("").forEach((c, idx) => { next[idx] = c; });
    setDigits(next);
    const lastFilled = Math.min(text.length - 1, 5);
    inputRefs.current[lastFilled]?.focus();
  }, []);

  return (
    <AuthBackdrop>
    <div className="flex flex-col gap-4 view-enter">
      <BrandLockup badgeSize={40} textSize={17} />
      <h1 className="font-[var(--font-head)] font-extrabold text-[26px] text-[var(--color-dark)]">{t("auth_verifyTitle")}</h1>
      <p className="text-[13px] text-[#5E7568]">{t("auth_verifySubtitle")} {phone}.</p>
      {devOtp && (
        <div className="flex flex-col gap-1 text-[12px] text-[#9A6B0A] bg-[#FFF8E9] border border-[#F3E1AE] rounded-lg px-3 py-2">
          <span>OTP service is temporarily unavailable. Demo login has been enabled.</span>
          <span className="font-bold">Demo OTP: {devOtp}</span>
          <span>Use this OTP to continue.</span>
        </div>
      )}
      <div className="flex gap-2 justify-center">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={d}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className="w-[42px] h-[54px] text-center text-[20px] border-[1.5px] border-[var(--color-mist)] rounded-xl bg-[var(--color-mist-2)] outline-none focus:border-[var(--color-secondary)] caret-transparent"
          />
        ))}
      </div>
      {error && <p className="text-[var(--color-danger)] text-[12.5px] text-center">{error}</p>}
      <p className="text-[13px] text-[#5E7568] text-center">
        <button disabled={resending} className="text-[var(--color-secondary)] font-semibold" onClick={resend}>
          {resending ? t("common_loading") : t("auth_resend")}
        </button>
      </p>
      <PrimaryButton disabled={verifying} onClick={verify}>{verifying ? t("common_loading") : t("auth_verifyBtn")}</PrimaryButton>
    </div>
    </AuthBackdrop>
  );
}

export function RegisterScreen() {
  const navigate = useNavigate();
  const t = useT();
  const [form, setForm] = useState({
    name: "", phone: "", language: "en", state: "Karnataka", district: "", village: "", crop: "", area: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ farmerCode: string; devOtp?: string } | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.name.trim() || !form.phone.trim()) { setError("Name and mobile number are required."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await services.auth.register({
        name: form.name, phone: form.phone, language: form.language, state: form.state,
        district: form.district, village: form.village, primaryCrop: form.crop,
        farmAreaAcres: Number(form.area) || 0,
      });
      setResult({ farmerCode: res.farmerCode, devOtp: (res as { devOtp?: string }).devOtp });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <AuthBackdrop wide>
      <div className="flex flex-col items-center gap-4 text-center view-enter">
        <div className="w-16 h-16 rounded-full bg-[#E7F5EC] flex items-center justify-center text-[var(--color-primary)]">
          <Icon name="check" className="w-7 h-7" />
        </div>
        <h2 className="font-[var(--font-head)] font-extrabold text-[19px]">Your AgroGon Farmer ID</h2>
        <div className="w-full bg-[var(--color-mist-2)] rounded-2xl p-4 border border-[var(--color-mist)]">
          <div className="font-mono text-[22px] font-bold tracking-wide text-[var(--color-primary)] text-center">{result.farmerCode}</div>
        </div>
        <div className="flex gap-2.5 w-full">
          <button className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[var(--color-primary)] bg-white border-[1.5px] border-[var(--color-primary)]">Copy ID</button>
          <button className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[var(--color-primary)] bg-white border-[1.5px] border-[var(--color-primary)]">Share ID</button>
        </div>
        <PrimaryButton onClick={() => navigate("/otp", { state: { phone: form.phone, purpose: "register", devOtp: result.devOtp } })}>
          Continue — Verify My Number
        </PrimaryButton>
      </div>
      </AuthBackdrop>
    );
  }

  return (
    <AuthBackdrop wide>
    <div className="view-enter">
      <div className="mb-4"><BrandLockup badgeSize={40} textSize={17} /></div>
      <ScreenHeader title={t("auth_createTitle")} back="/login" />
      <div className="flex flex-col gap-3.5">
        <Field label={t("auth_fullName")} placeholder="e.g. Ravi Kumar" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Field label={t("auth_mobileNumber")} placeholder="+91" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-[var(--color-dark)]">Preferred Language</span>
          <select className="border-[1.5px] border-[var(--color-mist)] bg-[var(--color-mist-2)] rounded-xl px-3.5 py-3 text-[14.5px]" value={form.language} onChange={(e) => set("language", e.target.value)}>
            <option value="en">English</option><option value="kn">Kannada</option><option value="te">Telugu</option>
            <option value="hi">Hindi</option><option value="ta">Tamil</option><option value="mr">Marathi</option><option value="bn">Bengali</option>
          </select>
        </label>
        <div className="flex gap-2.5">
          <div className="flex-1"><Field label="State" value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
          <div className="flex-1"><Field label="District" placeholder="Chikkaballapur" value={form.district} onChange={(e) => set("district", e.target.value)} /></div>
        </div>
        <Field label={t("auth_village")} placeholder="Hosahalli" value={form.village} onChange={(e) => set("village", e.target.value)} />
        <div className="flex gap-2.5">
          <div className="flex-1"><Field label="Primary Crop" placeholder="Tomato" value={form.crop} onChange={(e) => set("crop", e.target.value)} /></div>
          <div className="flex-1"><Field label="Farm Area (acres)" placeholder="2.7" value={form.area} onChange={(e) => set("area", e.target.value)} /></div>
        </div>
        {error && <p className="text-[var(--color-danger)] text-[12.5px]">{error}</p>}
        <PrimaryButton disabled={submitting} onClick={submit}>{submitting ? t("common_loading") : t("auth_createAccount")}</PrimaryButton>
      </div>
    </div>
    </AuthBackdrop>
  );
}
