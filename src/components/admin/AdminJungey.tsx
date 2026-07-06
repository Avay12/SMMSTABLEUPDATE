import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Loader2, Terminal, AlertTriangle, Check, X,
  Zap, TrendingUp, Users, Search, BarChart3, Shield, Clock,
  ChevronDown, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  tool_calls?: any[];
}

interface LogEntry {
  timestamp: string;
  tool: string;
  args: any;
  result?: any;
  status: "pending" | "confirmed" | "executed" | "cancelled";
  description?: string;
}

const WRITE_TOOLS = [
  "manage_services", // only create/update/delete
  "route_provider",
  "financial_control",
  "toggle_services",
  "user_support", // only adjust_balance
];

const isWriteAction = (name: string, args: any): boolean => {
  if (name === "manage_services") return ["create", "update", "delete"].includes(args?.action);
  if (name === "user_support") return args?.action === "adjust_balance";
  return WRITE_TOOLS.includes(name) && name !== "manage_services" && name !== "user_support";
};

const SUGGESTED_COMMANDS = [
  { icon: BarChart3, label: "Dashboard stats", cmd: "Show me the full dashboard stats — services, orders, revenue, providers" },
  { icon: TrendingUp, label: "Check all provider balances", cmd: "Check all provider balances and flag any low ones" },
  { icon: Search, label: "Find cheapest TikTok services", cmd: "Show me the 10 cheapest TikTok services sorted by price" },
  { icon: Zap, label: "Top selling services", cmd: "What are the top 10 most ordered services?" },
  { icon: Users, label: "Search a user", cmd: "Search for user with email " },
  { icon: Shield, label: "Disable a provider's services", cmd: "Disable all services from provider " },
];

const AdminJungey = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pendingTool, setPendingTool] = useState<{
    name: string;
    arguments: any;
    description: string;
    allToolCalls: any[];
    assistantContent: string;
    newMessages: Message[];
  } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingTool]);

  // Load persistent log from DB on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get("/admin/jungey/logs");
        if (data) {
          setLogs(data.map((l: any) => ({
            timestamp: l.createdAt,
            tool: l.tool_name,
            args: l.arguments,
            result: l.result,
            status: l.status,
            description: l.command_summary,
          })).reverse());
        }
      } catch (err) {
        console.error("Failed to load logs", err);
      }
    })();
  }, []);

  const getAuthHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
    };
  }, []);

  const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const headers = getAuthHeaders();
      const resp = await fetch(`${getApiUrl()}/admin/jungey`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Unknown error" }));
        toast({ title: "Jungey Error", description: errData.error, variant: "destructive" });
        setLoading(false);
        return;
      }

      await processStream(resp, newMessages);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const processStream = async (resp: Response, contextMessages: Message[]) => {
    const reader = resp.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";
    let toolCalls: any[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) {
            assistantContent += delta.content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCalls[idx]) toolCalls[idx] = { id: tc.id, function: { name: "", arguments: "" } };
              if (tc.function?.name) toolCalls[idx].function.name = tc.function.name;
              if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
            }
          }
        } catch { /* partial JSON */ }
      }
    }

    // Handle tool calls
    if (toolCalls.length > 0) {
      for (const tc of toolCalls) {
        try {
          const args = JSON.parse(tc.function.arguments);
          if (isWriteAction(tc.function.name, args)) {
            const desc = getToolDescription(tc.function.name, args);
            setPendingTool({
              name: tc.function.name,
              arguments: args,
              description: desc,
              allToolCalls: toolCalls,
              assistantContent,
              newMessages: contextMessages,
            });
            setLogs((prev) => [...prev, {
              timestamp: new Date().toISOString(),
              tool: tc.function.name,
              args,
              status: "pending",
              description: desc,
            }]);
          } else {
            // Read-only — execute directly
            const result = await executeToolCall(tc.function.name, args);
            setLogs((prev) => [...prev, {
              timestamp: new Date().toISOString(),
              tool: tc.function.name,
              args,
              result,
              status: "executed",
              description: `Read: ${tc.function.name}`,
            }]);
            const followUp: Message[] = [
              ...contextMessages,
              { role: "assistant", content: assistantContent, tool_calls: toolCalls },
              { role: "user", content: `[Tool Result] ${tc.function.name}: ${JSON.stringify(result)}` },
            ];
            setMessages(followUp);
            await streamFollowUp(followUp);
          }
        } catch (e) {
          console.error("Tool parse error:", e);
        }
      }
    }
  };

  const executeToolCall = async (name: string, args: any, description?: string) => {
    const headers = getAuthHeaders();
    const resp = await fetch(`${getApiUrl()}/admin/jungey`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ execute_tool: { name, arguments: args, description: description || `Executed ${name}` } }),
    });
    const data = await resp.json();
    return data.tool_result;
  };

  const confirmTool = async () => {
    if (!pendingTool) return;
    setLoading(true);
    const result = await executeToolCall(pendingTool.name, pendingTool.arguments, pendingTool.description);
    setLogs((prev) =>
      prev.map((l, i) => (i === prev.length - 1 ? { ...l, result, status: "executed" as const } : l))
    );

    const followUp: Message[] = [
      ...pendingTool.newMessages,
      { role: "assistant", content: pendingTool.assistantContent },
      { role: "user", content: `[Confirmed] ${pendingTool.name} result: ${JSON.stringify(result)}` },
    ];
    setMessages(followUp);
    setPendingTool(null);
    await streamFollowUp(followUp);
    setLoading(false);
  };

  const cancelTool = () => {
    setLogs((prev) =>
      prev.map((l, i) => (i === prev.length - 1 ? { ...l, status: "cancelled" as const } : l))
    );
    setMessages((prev) => [...prev, { role: "assistant", content: "Action cancelled. What else can I do?" }]);
    setPendingTool(null);
  };

  const streamFollowUp = async (msgs: Message[]) => {
    const headers = getAuthHeaders();
    const resp = await fetch(`${getApiUrl()}/admin/jungey`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ messages: msgs }),
    });
    if (!resp.ok) return;
    await processStream(resp, msgs);
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setPendingTool(null);
  };

  const getToolDescription = (name: string, args: any): string => {
    switch (name) {
      case "manage_services":
        if (args.action === "create") return `Create new service: "${args.data?.name || "unnamed"}"`;
        if (args.action === "update") return `Update service ${args.service_id?.slice(0, 8)}… — fields: ${Object.keys(args.data || {}).join(", ")}`;
        if (args.action === "delete") return `DELETE service ${args.service_id?.slice(0, 8)}…`;
        return `manage_services: ${args.action}`;
      case "route_provider":
        return `Route all ${args.filter_type === "category" ? `"${args.filter_value}" category` : args.filter_type} services → provider ${args.target_provider_id?.slice(0, 8)}…`;
      case "financial_control":
        return `${args.action.replace("_", " ")} ${args.field} by ${args.value}${args.action.includes("percent") ? "%" : ""} for "${args.category_filter}" services`;
      case "toggle_services":
        return `${args.enabled ? "Enable" : "Disable"} services by ${args.filter_type}: "${args.filter_value || "all"}"`;
      case "user_support":
        if (args.action === "adjust_balance") return `Adjust user ${args.user_id?.slice(0, 8)}… balance by ${args.amount >= 0 ? "+" : ""}$${args.amount}`;
        return `user_support: ${args.action}`;
      default:
        return `Execute ${name}`;
    }
  };

  const visibleMessages = messages.filter(
    (m) => !m.content.startsWith("[Tool Result]") && !m.content.startsWith("[Confirmed]")
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20"
            animate={{ boxShadow: ["0 0 15px hsl(var(--primary) / 0.2)", "0 0 25px hsl(var(--primary) / 0.4)", "0 0 15px hsl(var(--primary) / 0.2)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Bot className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Jungey
              <Badge variant="outline" className="text-[9px] font-mono tracking-wider border-primary/30 text-primary">AI CONTROLLER</Badge>
            </h2>
            <p className="text-xs text-muted-foreground">Full read/write database access · 8 tools · Activity logging</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1 text-muted-foreground" onClick={clearChat}>
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat — 3 cols */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card flex flex-col h-[650px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Welcome + Suggestions */}
              {showSuggestions && messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 py-8">
                  <div className="text-center">
                    <motion.div
                      className="h-16 w-16 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center shadow-xl shadow-primary/20 mb-4"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Bot className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                    <h3 className="text-lg font-bold">Jungey Command Center</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      I manage your entire SMM infrastructure. Services, providers, pricing, users — all via natural language.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                    {SUGGESTED_COMMANDS.map((cmd, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        onClick={() => {
                          if (cmd.cmd.endsWith(" ")) {
                            setInput(cmd.cmd);
                            inputRef.current?.focus();
                          } else {
                            sendMessage(cmd.cmd);
                          }
                        }}
                        className="flex items-center gap-3 rounded-xl bg-secondary/50 hover:bg-secondary p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <cmd.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{cmd.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{cmd.cmd}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              <AnimatePresence>
                {visibleMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/80 text-foreground border border-border/50"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>table]:my-2 [&>pre]:my-2 [&>pre]:bg-background/50 [&>pre]:rounded-lg [&>pre]:p-3">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Confirmation Card */}
              <AnimatePresence>
                {pendingTool && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border-2 border-[hsl(var(--fame-orange))]/40 bg-gradient-to-br from-[hsl(var(--fame-orange))]/5 to-transparent p-5 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-[hsl(var(--fame-orange))]/10 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-[hsl(var(--fame-orange))]" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground">Change Summary</span>
                        <p className="text-[10px] text-muted-foreground font-mono">{pendingTool.name}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-secondary/80 p-3 text-sm text-foreground font-medium">
                      {pendingTool.description}
                    </div>

                    <div className="rounded-xl bg-background/50 p-2">
                      <p className="text-[10px] font-mono text-muted-foreground break-all">
                        {JSON.stringify(pendingTool.arguments).slice(0, 200)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-xl gap-1.5 shadow-sm" onClick={confirmTool} disabled={loading}>
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Approve & Execute
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={cancelTool}>
                        <X className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading */}
              {loading && !pendingTool && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="bg-secondary/80 border border-border/50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="font-mono text-xs">Processing...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border bg-secondary/20">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <div className="relative flex-1">
                <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Command Jungey..."
                  className="pl-9 rounded-xl bg-background border-border font-mono text-sm"
                  disabled={loading || !!pendingTool}
                />
              </div>
              <Button type="submit" size="icon" className="rounded-xl shrink-0 shadow-sm" disabled={loading || !!pendingTool || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Activity Log — 1 col */}
        <div className="rounded-2xl border border-border bg-card flex flex-col h-[650px]">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Activity Log</span>
            </div>
            <Badge variant="outline" className="text-[9px]">{logs.filter(l => l.status === "executed").length} ops</Badge>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1.5">
              {logs.length === 0 && (
                <div className="text-center py-8">
                  <Terminal className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground">No operations logged yet</p>
                </div>
              )}
              {[...logs].reverse().slice(0, 30).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-xl p-2.5 space-y-1 border transition-colors ${
                    log.status === "executed"
                      ? "bg-primary/5 border-primary/10"
                      : log.status === "cancelled"
                      ? "bg-destructive/5 border-destructive/10"
                      : "bg-secondary border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-primary truncate max-w-[120px]">{log.tool}</span>
                    <Badge
                      variant={log.status === "executed" ? "default" : log.status === "cancelled" ? "destructive" : "outline"}
                      className="text-[8px] h-4 px-1.5"
                    >
                      {log.status === "executed" ? "✓" : log.status === "cancelled" ? "✗" : "⏳"}
                    </Badge>
                  </div>
                  {log.description && (
                    <p className="text-[10px] text-foreground/80 leading-tight">{log.description.slice(0, 80)}</p>
                  )}
                  {log.result?.count !== undefined && (
                    <p className="text-[10px] text-primary font-mono">{log.result.count} rows affected</p>
                  )}
                  <p className="text-[8px] text-muted-foreground font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AdminJungey;
