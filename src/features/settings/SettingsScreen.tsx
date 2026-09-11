import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "../../components/cards/Cards";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher";
import { SecondaryButton, Field, PrimaryButton } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <b className="text-[13.5px]">{label}</b>
        <div className="text-[12px] text-[#5E7568]">{sub}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${value ? "bg-[var(--color-primary)] justify-end" : "bg-[var(--color-mist)] justify-start"}`}
      >
        <span className="w-5 h-5 bg-white rounded-full shadow" />
      </button>
    </div>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { online, showToast } = useApp();
  const t = useT();
  const [notifPush, setNotifPush] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [changingPw, setChangingPw] = useState(false);

  return (
    <div className="view-enter max-w-2xl flex flex-col gap-3.5">
      <ScreenHeader title={t("settings_account")} />

      <Card className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <b className="text-[13.5px]">{t("settings_language")}</b>
            <div className="text-[12px] text-[#5E7568]">{t("settings_langDesc")}</div>
          </div>
          <LanguageSwitcher />
        </div>
        <div className="h-px bg-[var(--color-mist)]" />
        <div className="flex items-center justify-between">
          <div>
            <b className="text-[13.5px]">{t("settings_network")}</b>
            <div className="text-[12px] text-[#5E7568]">{t("settings_networkDesc")}</div>
          </div>
          <span className={`text-[11.5px] font-bold px-3 py-1.5 rounded-full ${online ? "bg-[#E7F5EC] text-[var(--color-primary)]" : "bg-[#FFF3E0] text-[#9A6B0A]"}`}>
            {online ? `🟢 ${t("status_online")}` : `🟠 ${t("status_offline")}`}
          </span>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <div className="font-[var(--font-head)] font-bold text-[15px]">{t("settings_notifications")}</div>
        <ToggleRow label={t("settings_pushNotif")} sub={t("settings_pushNotifDesc")} value={notifPush} onChange={setNotifPush} />
        <div className="h-px bg-[var(--color-mist)]" />
        <ToggleRow label={t("settings_weatherAlerts")} sub={t("settings_weatherAlertsDesc")} value={notifAlerts} onChange={setNotifAlerts} />
      </Card>

      <Card className="flex flex-col gap-3.5">
        <div className="font-[var(--font-head)] font-bold text-[15px]">{t("settings_cameraSettings")}</div>
        <p className="text-[12.5px] text-[#5E7568]">{t("settings_cameraDesc")}</p>
        <SecondaryButton onClick={() => navigate("/camera")}>{t("settings_openCamera")}</SecondaryButton>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="font-[var(--font-head)] font-bold text-[15px]">{t("settings_changePassword")}</div>
          {!changingPw && <button className="text-[12px] font-bold text-[var(--color-primary)]" onClick={() => setChangingPw(true)}>{t("settings_change")}</button>}
        </div>
        {changingPw && (
          <>
            <Field label={t("settings_currentPassword")} type="password" />
            <Field label={t("settings_newPassword")} type="password" />
            <Field label={t("settings_confirmPassword")} type="password" />
            <div className="flex gap-2.5">
              <div className="flex-1"><SecondaryButton onClick={() => setChangingPw(false)}>{t("action_cancel")}</SecondaryButton></div>
              <div className="flex-1"><PrimaryButton onClick={() => { setChangingPw(false); showToast("Password updated"); }}>{t("settings_updatePassword")}</PrimaryButton></div>
            </div>
          </>
        )}
      </Card>

      <SecondaryButton onClick={() => navigate("/login")}>{t("action_logOut")}</SecondaryButton>
      <div className="text-center font-mono text-[10.5px] text-[#8AA093] mb-2">AgroGon v1.0.0</div>
    </div>
  );
}
