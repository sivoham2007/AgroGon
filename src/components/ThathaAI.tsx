import { useState, useRef, useEffect } from "react";
import { Icon } from "./ui/Icon";
import { useApp } from "../app/AppState";
import { apiFetch } from "../services/http/client";

export function ThathaAI() {
  const { farmer, isAuthenticated } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{role: "ai"|"user", text: string}[]>([
    { role: "ai", text: `Namaskaram, ${farmer?.name || 'Farmer'}! I am Thatha AI. What farming advice do you need today?` }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) return null;


  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message.trim();
    setChat(prev => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      const data = await apiFetch<{reply: string}>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg })
      });
      
      if (data && data.reply) {
        setChat(prev => [...prev, { role: "ai", text: data.reply }]);
      } else {
        setChat(prev => [...prev, { role: "ai", text: "Sorry, I couldn't generate a response right now. Please try again." }]);
      }
    } catch (err: any) {
      console.error("Thatha AI Error:", err);
      const errorMsg = err.message && err.message !== "Failed to fetch" 
        ? err.message 
        : "Thatha AI is temporarily unavailable. Please try again.";
      setChat(prev => [...prev, { role: "ai", text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 bg-[var(--color-primary)] rounded-full shadow-xl flex items-center justify-center transform transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
        style={{ boxShadow: "0 8px 30px rgba(27,127,76,0.3)" }}
      >
        <span className="text-3xl">👨🏽‍🌾</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-96px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--color-mist)]">
          
          {/* Header */}
          <div className="bg-[var(--color-primary)] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">👨🏽‍🌾</div>
              <div>
                <div className="font-[var(--font-head)] font-bold text-[15px]">Thatha AI</div>
                <div className="text-[11px] text-[#BFE0CC]">Agricultural Assistant</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-black/10 rounded-full hover:bg-black/20">
              <Icon name="close" className="w-4 h-4" />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBF9] flex flex-col gap-3 text-[13px]">
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${c.role === 'user' ? 'bg-[var(--color-primary)] text-white rounded-br-none' : 'bg-white border border-[var(--color-mist)] text-[var(--color-dark)] rounded-bl-none shadow-sm'}`}>
                  {c.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[var(--color-mist)] rounded-2xl rounded-bl-none shadow-sm px-4 py-3 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-[var(--color-mist)] flex gap-2">
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 bg-[var(--color-mist-2)] rounded-full px-4 py-2.5 text-[13px] outline-none border border-transparent focus:border-[var(--color-primary)] transition-colors"
            />
            <button 
              type="submit" 
              disabled={!message.trim() || loading}
              className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Icon name="send" className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
