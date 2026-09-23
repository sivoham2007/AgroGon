import { useState, useEffect } from "react";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import { Card } from "../../components/cards/Cards";
import { Button, GhostButton, Input, Select } from "../../components/ui/Primitives";

export function AdminPanelScreen() {
    const t = useT();
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        rule_type: "disease_threshold",
        rule_key: "leaf_blight_critical",
        rule_data: "{}"
    });

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await services.admin.getRules();
            setRules(Array.isArray(data) ? data : []);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to load rules.");
            setRules([]);
        } finally {
            setLoading(false);
        }
    };

    const addRule = async () => {
        setError(null);
        try {
            await services.admin.addRule({
                ...form,
                rule_data: JSON.parse(form.rule_data)
            });
            setShowForm(false);
            setForm({ rule_type: "disease_threshold", rule_key: "", rule_data: "{}" });
            await loadRules();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to add rule. Invalid JSON data or network error.");
        }
    };

    const deleteRule = async (id: string) => {
        if (!confirm("Delete rule?")) return;
        setError(null);
        try {
            await services.admin.deleteRule(id);
            await loadRules();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to delete rule.");
        }
    };

    if (loading) return <div className="p-4">{t("common_loading")}</div>;

    return (
        <div className="view-enter max-w-2xl mx-auto flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-[var(--font-head)] font-extrabold text-[22px] text-[var(--color-dark)]">{t("admin_title")}</h1>
                    <p className="text-[13px] text-[#5E7568]">Manage dynamic rules for the agricultural engine.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>{t("admin_addRule")}</Button>
            </div>

            {showForm && (
                <Card className="bg-[var(--color-mist-2)] border-none">
                    <h2 className="font-bold mb-3">{t("admin_addRule")}</h2>
                    <div className="flex flex-col gap-3">
                        <Select label="Rule Type" value={form.rule_type} onChange={e => setForm({...form, rule_type: e.target.value})}>
                            <option value="disease_threshold">Disease Threshold</option>
                            <option value="fertilizer_calc">Fertilizer Calculation</option>
                            <option value="crop_suitability">Crop Suitability</option>
                            <option value="weather_warning">Weather Warning</option>
                        </Select>
                        <Input label="Rule Key (Unique)" value={form.rule_key} onChange={e => setForm({...form, rule_key: e.target.value})} />
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#8AA093] uppercase tracking-wider">Rule Data (JSON)</label>
                            <textarea 
                                className="w-full bg-white border border-[#D5DFD9] rounded-xl px-4 py-3 text-[15px] text-[var(--color-dark)] outline-none min-h-[120px] font-mono"
                                value={form.rule_data}
                                onChange={e => setForm({...form, rule_data: e.target.value})}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                            <GhostButton onClick={() => setShowForm(false)}>Cancel</GhostButton>
                            <Button onClick={addRule}>Save Rule</Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="flex flex-col gap-3">
                {error && (
                    <div className="p-3 bg-[#FBE8E7] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-lg text-[13px]">
                        {error}
                    </div>
                )}
                {(rules ?? []).map((r: any) => (
                    <Card key={r.id}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-[15px]">{r.rule_key}</h3>
                                <div className="text-[11px] text-[#8AA093]">{r.rule_type}</div>
                            </div>
                            <button onClick={() => deleteRule(r.id)} className="text-[var(--color-danger)] text-[12px] font-bold px-2 py-1 hover:bg-[#FBE8E7] rounded-lg">Delete</button>
                        </div>
                        <pre className="bg-[#F6F8F7] p-3 rounded-lg text-[11px] overflow-x-auto text-[#5E7568]">
                            {JSON.stringify(r.rule_data, null, 2)}
                        </pre>
                    </Card>
                ))}
                {(!rules || rules.length === 0) && <div className="text-center p-8 text-[#8AA093]">No rules found.</div>}
            </div>
        </div>
    );
}
