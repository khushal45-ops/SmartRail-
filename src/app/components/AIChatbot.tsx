import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { chatResponses, trains, pnrRecords } from "../data/mockData";
import { Bot, Send, User, Sparkles, RotateCcw, Train, TicketIcon, AlertTriangle, LayoutGrid } from "lucide-react";
import { sendChatMessage } from "../../api";

type Message = { role: "user" | "assistant"; text: string; time: string };

const quickActions = [
  { label: "Check PNR Status", icon: TicketIcon, query: "How do I check my PNR status?" },
  { label: "Train Delays", icon: AlertTriangle, query: "Which trains are currently delayed?" },
  { label: "Live Train Status", icon: Train, query: "How can I check live train status?" },
  { label: "Platform Info", icon: LayoutGrid, query: "How can I find platform information?" },
];

const suggestions = [
  "How do I cancel my ticket?",
  "What is the refund policy?",
  "Which trains are delayed today?",
  "Check PNR 2451369874",
  "Help",
];

function getResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("pnr") || /\d{10}/.test(lower)) {
    return "PNR Status: Confirmed ✅ | Passenger: Rahul Sharma | Train: Rajdhani Express 12301 | Seat: B2-45 | Journey: NDLS → HWH | Date: Today";
  }

  if (lower.includes("delayed") || lower.includes("delay") || lower.includes("status")) {
    return "Delayed trains today: 1) Mumbai Rajdhani #12951 - 25 min delay 2) Howrah Mail #12322 - 18 min delay 3) Kerala Express #12625 - 42 min delay 4) Deccan Queen #12124 - 12 min delay";
  }

  if (lower.includes("cancel")) {
    return "To cancel ticket: 1) Go to smartrail.in 2) Login → My Bookings 3) Select ticket → Cancel 4) Refund in 5-7 working days";
  }

  if (lower.includes("refund")) {
    return "Refund Policy: Cancelled 48hrs before → 75% refund | 24-48hrs → 50% refund | 12-24hrs → 25% refund | Less than 12hrs → No refund";
  }

  if (lower.includes("platform")) {
    return "Platform info: Rajdhani Express → Platform 3 | Mumbai Mail → Platform 7 | Check display boards at station for live updates";
  }

  if (lower.includes("seat") || lower.includes("availability")) {
    return "Seat Availability: Sleeper class has 42 seats available | 3AC has 18 seats | 2AC has 6 seats available on most trains today";
  }

  if (lower.includes("help") || lower.includes("hi") || lower.includes("hello")) {
    return "Hello! I can help you with: PNR Status, Train Delays, Ticket Cancellation, Refund Policy, Platform Info, Seat Availability. What do you need?";
  }

  return "I can help with PNR status, train delays, cancellation, refunds, and platform info. Please ask a specific question.";
}

function formatMessage(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-medium">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hello! I'm **SmartRail AI**, your AI assistant for the Railway Management Platform. I can help you with PNR tracking, train status, ticket management, and more. What can I help you with today?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", text, time }]);
    setInput("");
    setIsTyping(true);
    
    // Try the live AI backend first, fall back to local responses
    try {
      const response = await sendChatMessage(text);
      const reply = response.reply;
      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
        return;
      }
    } catch (_) {
      // Backend unavailable — use local response engine
    } finally {
      // give a natural typing feel even for local responses
    }

    // Local response engine (always works offline)
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));
    const localReply = getResponse(text);
    setMessages((prev) => [...prev, { role: "assistant", text: localReply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setIsTyping(false);
  };

  const reset = () => {
    setMessages([{ role: "assistant", text: "Hello! I'm **SmartRail AI**, your AI assistant. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            AI Chatbot Assistant
          </h2>
          <p className="text-slate-400 text-sm">SmartRail AI — Powered by AI for passenger support</p>
        </div>
        <Button onClick={reset} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10">
          <RotateCcw className="w-4 h-4 mr-2" /> New Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="bg-slate-900/50 border-white/10 flex flex-col" style={{ height: "560px" }}>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-white font-medium">SmartRail AI</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Online
                </div>
              </div>
              <Badge className="ml-auto bg-violet-500/20 text-violet-400 border-violet-500/30">AI Assistant</Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-violet-500/20" : "bg-blue-500/20"}`}>
                    {msg.role === "assistant" ? <Bot className="w-4 h-4 text-violet-400" /> : <User className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "assistant" ? "bg-white/5 text-slate-300 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
                      {formatMessage(msg.text)}
                    </div>
                    <div className="text-xs text-slate-600 px-1">{msg.time}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-300 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask SmartRail AI anything..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
                <Button onClick={() => sendMessage(input)} className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0" disabled={!input.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-4 pb-4">
              <div className="text-slate-300 text-sm font-medium mb-3">Quick Actions</div>
              <div className="flex flex-col gap-2">
                {quickActions.map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={qa.label}
                      onClick={() => sendMessage(qa.query)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all text-left"
                    >
                      <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{qa.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-4 pb-4">
              <div className="text-slate-300 text-sm font-medium mb-3">SmartRail AI Capabilities</div>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                {[
                  "PNR status lookup",
                  "Live train tracking",
                  "Delay notifications",
                  "Refund guidance",
                  "Ticket management",
                  "Platform information",
                  "Route suggestions",
                  "Complaint logging",
                ].map((cap) => (
                  <div key={cap} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                    {cap}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-violet-500/10 border-violet-500/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-violet-300 text-sm font-medium">AI Stats</span>
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between"><span className="text-violet-400/70">Queries Today</span><span className="text-violet-300">1,842</span></div>
                <div className="flex justify-between"><span className="text-violet-400/70">Resolved</span><span className="text-violet-300">94%</span></div>
                <div className="flex justify-between"><span className="text-violet-400/70">Avg Response</span><span className="text-violet-300">1.2s</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
