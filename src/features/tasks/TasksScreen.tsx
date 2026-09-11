import { useState } from "react";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { Pill, PrimaryButton, EmptyState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";

type Priority = "low" | "medium" | "high";
interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string;
  done: boolean;
}

const SEED_TASKS: Task[] = [
  { id: "t1", title: "Inspect Zone D for disease spread", priority: "high", dueDate: "Today", done: false },
  { id: "t2", title: "Check drip irrigation lines — North Field", priority: "medium", dueDate: "Tomorrow", done: false },
  { id: "t3", title: "Apply recommended micronutrient mix — Zone C", priority: "medium", dueDate: "In 2 days", done: false },
  { id: "t4", title: "Clean and re-check Camera 01 mounting", priority: "low", dueDate: "This week", done: true },
];

export function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("Today");

  function addTask() {
    if (!title.trim()) return;
    setTasks((t) => [{ id: `t-${Date.now()}`, title: title.trim(), priority, dueDate, done: false }, ...t]);
    setTitle("");
  }

  function toggle(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function remove(id: string) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="view-enter max-w-2xl flex flex-col gap-5">
      <ScreenHeader title="Farm Tasks" eyebrow={`${pending.length} pending`} />

      <Card className="flex flex-col gap-3">
        <div className="font-[var(--font-head)] font-bold text-[15px]">Add a task</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="e.g. Water crops in South Field"
          className="border-[1.5px] border-[var(--color-mist)] bg-[var(--color-mist-2)] rounded-xl px-3.5 py-3 text-[14px] outline-none focus:border-[var(--color-secondary)]"
        />
        <div className="flex gap-2.5 flex-wrap">
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="border border-[var(--color-mist)] rounded-lg px-2.5 py-2 text-[12.5px] bg-white">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <select value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border border-[var(--color-mist)] rounded-lg px-2.5 py-2 text-[12.5px] bg-white">
            <option>Today</option><option>Tomorrow</option><option>In 2 days</option><option>This week</option>
          </select>
        </div>
        <PrimaryButton onClick={addTask}>Add Task</PrimaryButton>
      </Card>

      <div>
        <div className="font-[var(--font-head)] font-bold text-[15px] mb-2.5">Pending ({pending.length})</div>
        {pending.length === 0 && <EmptyState title="No pending tasks — you're all caught up." />}
        <div className="flex flex-col gap-2.5">
          {pending.map((t) => (
            <Card key={t.id} tight className="flex items-center gap-3">
              <button onClick={() => toggle(t.id)} className="w-5 h-5 rounded-md border-2 border-[var(--color-mist)] flex-none" />
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold">{t.title}</div>
                <div className="text-[11.5px] text-[#8AA093]">{t.dueDate}</div>
              </div>
              <Pill level={t.priority}>{t.priority.toUpperCase()}</Pill>
              <button onClick={() => remove(t.id)} className="text-[#C4CFC7] hover:text-[var(--color-danger)]">
                <Icon name="back" className="w-4 h-4 rotate-45" />
              </button>
            </Card>
          ))}
        </div>
      </div>

      {done.length > 0 && (
        <div>
          <div className="font-[var(--font-head)] font-bold text-[15px] mb-2.5">Completed ({done.length})</div>
          <div className="flex flex-col gap-2.5">
            {done.map((t) => (
              <Card key={t.id} tight className="flex items-center gap-3 opacity-60">
                <button onClick={() => toggle(t.id)} className="w-5 h-5 rounded-md bg-[var(--color-primary)] flex items-center justify-center flex-none">
                  <Icon name="check" className="w-3 h-3 text-white" />
                </button>
                <div className="flex-1 text-[13.5px] font-semibold line-through">{t.title}</div>
                <button onClick={() => remove(t.id)} className="text-[#C4CFC7] hover:text-[var(--color-danger)]">
                  <Icon name="back" className="w-4 h-4 rotate-45" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
