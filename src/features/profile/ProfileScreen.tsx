import { useState, useEffect } from "react";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { Field, PrimaryButton, SecondaryButton } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { httpProfileService } from "../../services/http/profileService";
import { ApiError } from "../../services/http/client";

export function ProfileScreen() {
  const { farmer, farm, showToast, updateFarmer } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: farmer.name || "", phone: farmer.phone || "", email: farmer.email || "", 
    village: farmer.village || "", district: farmer.district || "", 
    crop: farmer.primaryCrop || farm.crop || "", age: farmer.age?.toString() || "",
    area: farmer.farmAreaAcres?.toString() || "", username: farmer.farmerCode || "",
  });

  useEffect(() => {
    setForm({
      name: farmer.name || "", phone: farmer.phone || "", email: farmer.email || "", 
      village: farmer.village || "", district: farmer.district || "", 
      crop: farmer.primaryCrop || farm.crop || "", age: farmer.age?.toString() || "",
      area: farmer.farmAreaAcres?.toString() || "", username: farmer.farmerCode || "",
    });
  }, [farmer, farm.crop]);

  function set<K extends keyof typeof form>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const updated = await httpProfileService.update({
        name: form.name, village: form.village, district: form.district, 
        primaryCrop: form.crop, email: form.email, 
        age: form.age ? parseInt(form.age, 10) : undefined,
        farmAreaAcres: form.area ? parseFloat(form.area) : undefined,
      });
      updateFarmer(updated);
      setEditing(false);
      showToast("Profile updated");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="view-enter max-w-2xl flex flex-col gap-3.5">
      <ScreenHeader title="Profile" />

      <Card className="text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-[var(--color-mist-2)] flex items-center justify-center mx-auto mb-2.5 text-[var(--color-primary)] relative">
          <Icon name="profile" className="w-8 h-8" />
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center border-2 border-white" onClick={() => showToast("Photo upload isn't connected yet")}>
            <Icon name="camera" className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="font-[var(--font-head)] font-bold text-[16px]">{farmer.name || "Farmer"}</div>
        <div className="font-mono text-[12px] text-[#5E7568] mt-0.5">{farmer.farmerCode || "No code assigned"}</div>
        <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-[var(--color-mist)] text-[12.5px]">
          <div><b className="text-[15px] block">2</b><span className="text-[#5E7568]">Farms</span></div>
          <div><b className="text-[15px] block">2</b><span className="text-[#5E7568]">Fields</span></div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="font-[var(--font-head)] font-bold text-[15px]">Personal Information</div>
          {!editing && <button className="text-[12px] font-bold text-[var(--color-primary)]" onClick={() => setEditing(true)}>Edit</button>}
        </div>
        {editing ? (
          <>
            <Field label="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            <Field label="Phone Number" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <Field label="Email Address" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <Field label="Age" value={form.age} onChange={(e) => set("age", e.target.value)} />
            <Field label="Village" value={form.village} onChange={(e) => set("village", e.target.value)} />
            <Field label="District" value={form.district} onChange={(e) => set("district", e.target.value)} />
            <Field label="Primary Crop" value={form.crop} onChange={(e) => set("crop", e.target.value)} />
            <Field label="Farm Area (Acres)" value={form.area} onChange={(e) => set("area", e.target.value)} />
            {error && <div className="text-[12.5px] text-[#B3261E] bg-[#FCEBEA] rounded-lg px-3 py-2">{error}</div>}
            <div className="flex gap-2.5">
              <div className="flex-1"><SecondaryButton onClick={() => setEditing(false)} disabled={saving}>Cancel</SecondaryButton></div>
              <div className="flex-1"><PrimaryButton onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</PrimaryButton></div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2.5 text-[13.5px]">
            {[
              ["Full Name", farmer.name], ["Phone Number", farmer.phone], ["Email Address", farmer.email], 
              ["Age", farmer.age], ["Village", farmer.village], ["District", farmer.district], 
              ["Primary Crop", farmer.primaryCrop], ["Farm Area (Acres)", farmer.farmAreaAcres]
            ].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-[#5E7568]">{k}</span><b className={!v ? "text-[#8AA093] font-normal" : ""}>{v || "Not provided"}</b></div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
