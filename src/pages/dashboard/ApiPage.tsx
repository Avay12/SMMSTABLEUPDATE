import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Copy, Check, Code, Eye, EyeOff, RefreshCw, Play, Loader2,
  Wallet, ShoppingCart, Search, List, AlertTriangle, BookOpen, ChevronRight, Key, Shield, Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";

type EndpointKey = "balance" | "services" | "add" | "status";

const ApiPage = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<EndpointKey>("balance");
  const [testApiKey, setTestApiKey] = useState("");
  const [testParams, setTestParams] = useState<Record<string, string>>({});
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [activeLang, setActiveLang] = useState("curl");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // API key state from database
  const [apiKey, setApiKey] = useState("");
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const maskedKey = apiKey ? `fs_${"*".repeat(Math.max(0, apiKey.length - 3))}` : "";
  const API_URL = "https://smmstable.com/api";

  // Load existing API key from database
  useEffect(() => {
    if (!user?.id) return;
    const loadKey = async () => {
      setApiKeyLoading(true);
      try {
        const response = await apiClient.get("/api-keys");
        if (response.data?.apiKey) setApiKey(response.data.apiKey);
      } catch (err) {
        console.error("Failed to load API key", err);
      }
      setApiKeyLoading(false);
    };
    loadKey();
  }, [user?.id]);

  const generateApiKey = () => {
    const rand = crypto.getRandomValues(new Uint8Array(24));
    const hex = Array.from(rand).map(b => b.toString(16).padStart(2, "0")).join("");
    return `fs_${hex}`;
  };

  const handleGenerateKey = async () => {
    if (!user?.id) return;
    setGenerating(true);
    try {
      const response = await apiClient.post("/api-keys/generate");
      setApiKey(response.data.apiKey);
      setVisible(true);
      toast({ title: "API Key Generated", description: "Your new key is ready. Keep it secret!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleRotateKey = async () => {
    if (!user?.id || !apiKey) return;
    setGenerating(true);
    try {
      const response = await apiClient.post("/api-keys/rotate");
      setApiKey(response.data.apiKey);
      setVisible(true);
      toast({ title: "API Key Rotated", description: "Your old key has been revoked. Use the new one." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!user?.id) return;
    try {
      await apiClient.post("/api-keys/revoke");
      setApiKey("");
      setVisible(false);
      toast({ title: "API Key Revoked", description: "All your API keys have been deactivated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const sidebarItems: { key: EndpointKey; label: string; icon: React.ReactNode }[] = [
    { key: "balance", label: "Balance", icon: <Wallet className="h-4 w-4" /> },
    { key: "services", label: "Services", icon: <List className="h-4 w-4" /> },
    { key: "add", label: "New Order", icon: <ShoppingCart className="h-4 w-4" /> },
    { key: "status", label: "Order Status", icon: <Search className="h-4 w-4" /> },
  ];

  const endpoints: Record<EndpointKey, {
    method: string;
    title: string;
    desc: string;
    params: { name: string; type: string; desc: string; required: boolean }[];
    bodyExample: Record<string, string>;
    headerExample: Record<string, string>;
    response: string;
  }> = {
    balance: {
      method: "POST",
      title: "Check Balance",
      desc: "Returns your current account balance and currency.",
      params: [
        { name: "key", type: "string", desc: "Your API key (body) or use x-api-key header", required: true },
        { name: "action", type: "string", desc: '"balance"', required: true },
      ],
      bodyExample: { key: "YOUR_API_KEY", action: "balance" },
      headerExample: { "x-api-key": "YOUR_API_KEY", "Content-Type": "application/json" },
      response: JSON.stringify({ balance: "50.00", currency: "USD" }, null, 2),
    },
    services: {
      method: "POST",
      title: "List Services",
      desc: "Returns all available services with pricing, min/max quantities.",
      params: [
        { name: "key", type: "string", desc: "Your API key (body) or use x-api-key header", required: true },
        { name: "action", type: "string", desc: '"services"', required: true },
      ],
      bodyExample: { key: "YOUR_API_KEY", action: "services" },
      headerExample: { "x-api-key": "YOUR_API_KEY", "Content-Type": "application/json" },
      response: JSON.stringify([
        { service: 1, name: "Instagram Followers", category: "Instagram", type: "Default", rate: "5.23", min: 100, max: 10000, cancel: false, refill: false }
      ], null, 2),
    },
    add: {
      method: "POST",
      title: "Place New Order",
      desc: "Submit a new order for a specific service.",
      params: [
        { name: "key", type: "string", desc: "Your API key (body) or use x-api-key header", required: true },
        { name: "action", type: "string", desc: '"add"', required: true },
        { name: "service", type: "string", desc: "Service ID from the services list", required: true },
        { name: "link", type: "string", desc: "URL/link for the order target", required: true },
        { name: "quantity", type: "string", desc: "Order quantity (within min/max range)", required: true },
      ],
      bodyExample: { key: "YOUR_API_KEY", action: "add", service: "1", link: "https://instagram.com/user", quantity: "1000" },
      headerExample: { "x-api-key": "YOUR_API_KEY", "Content-Type": "application/json" },
      response: JSON.stringify({ order: "12345" }, null, 2),
    },
    status: {
      method: "POST",
      title: "Check Order Status",
      desc: "Retrieve the current status and details of an existing order.",
      params: [
        { name: "key", type: "string", desc: "Your API key (body) or use x-api-key header", required: true },
        { name: "action", type: "string", desc: '"status"', required: true },
        { name: "order", type: "string", desc: "Order ID returned from the add action", required: true },
      ],
      bodyExample: { key: "YOUR_API_KEY", action: "status", order: "12345" },
      headerExample: { "x-api-key": "YOUR_API_KEY", "Content-Type": "application/json" },
      response: JSON.stringify({ charge: "0.50", start_count: "0", status: "Completed", remains: "0", currency: "USD" }, null, 2),
    },
  };

  const errorCodes = [
    { code: "401", label: "Unauthorized", desc: "API key is missing, invalid, or deactivated" },
    { code: "400", label: "Bad Request", desc: "Missing required parameters or invalid values" },
    { code: "400", label: "Insufficient Balance", desc: "Your account balance is too low for this order" },
    { code: "400", label: "Service Not Found", desc: "The service ID does not exist or is disabled" },
    { code: "400", label: "Invalid Quantity", desc: "Quantity is outside the allowed min/max range" },
    { code: "500", label: "Server Error", desc: "Internal server error, try again later" },
  ];

  const generateSnippet = (ep: typeof endpoints[EndpointKey], lang: string) => {
    const body = JSON.stringify(ep.bodyExample, null, 2);
    const bodyInline = JSON.stringify(ep.bodyExample);

    switch (lang) {
      case "curl":
        return `curl -X POST "${API_URL}" \\
  -H "Content-Type: application/json" \\
  -d '${bodyInline}'`;
      case "curl-header":
        return `curl -X POST "${API_URL}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '${JSON.stringify({ action: ep.bodyExample.action, ...Object.fromEntries(Object.entries(ep.bodyExample).filter(([k]) => k !== "key")) })}'`;
      case "php":
        return `<?php
$url = "${API_URL}";
$data = ${body};

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;`;
      case "python":
        return `import requests

url = "${API_URL}"
payload = ${body}

response = requests.post(url, json=payload)
print(response.json())`;
      case "javascript":
        return `const response = await fetch("${API_URL}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${body})
});

const data = await response.json();
console.log(data);`;
      default:
        return "";
    }
  };

  const handleTest = async (key: EndpointKey) => {
    if (!testApiKey.trim()) {
      toast({ title: "API key required", description: "Enter your API key to test.", variant: "destructive" });
      return;
    }
    setTestLoading(true);
    setTestResponse(null);
    try {
      const body: Record<string, string> = { key: testApiKey, action: key };
      if (key === "add") {
        body.service = testParams.service || "1";
        body.link = testParams.link || "";
        body.quantity = testParams.quantity || "100";
      }
      if (key === "status") {
        body.order = testParams.order || "";
      }
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        setTestResponse(JSON.stringify(parsed, null, 2));
      } catch {
        setTestResponse(text);
      }
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTestLoading(false);
    }
  };

  const scrollToSection = (key: EndpointKey) => {
    setActiveSection(key);
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Playfair_Display']">API Documentation</h1>
            <p className="text-sm text-muted-foreground">Integrate Smmstable into your platform</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-56 shrink-0">
          <div className="lg:sticky lg:top-4 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-3">
              Actions
            </p>
            {sidebarItems.map(item => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeSection === item.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                <ChevronRight className={`h-3.5 w-3.5 ml-auto transition-transform ${activeSection === item.key ? "translate-x-0.5" : "opacity-0 group-hover:opacity-50"}`} />
              </button>
            ))}

            <div className="border-t border-border my-4" />

            <button
              onClick={() => document.getElementById("error-codes")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Error Codes</span>
            </button>
            <button
              onClick={() => document.getElementById("quick-start")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span>Quick Start</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* API Key Management */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Key className="h-4.5 w-4.5 text-primary" />
                <h2 className="font-semibold text-base">API Key</h2>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Secure</span>
              </div>
            </div>

            {apiKeyLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading your API key...</span>
              </div>
            ) : !apiKey ? (
              <div className="text-center py-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Generate an API key to start making requests</p>
                <Button onClick={handleGenerateKey} disabled={generating} className="gap-2">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  Generate API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your API Key</label>
                  <div className="flex gap-2">
                    <Input className="bg-secondary border-border font-mono text-sm h-11 flex-1" value={visible ? apiKey : maskedKey} readOnly />
                    <Button variant="outline" size="icon" onClick={() => setVisible(!visible)} className="h-11 w-11 shrink-0">
                      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => copyText(apiKey, "key")} className="h-11 w-11 shrink-0">
                      {copied === "key" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRotateKey} disabled={generating} className="text-xs gap-1.5">
                    {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Rotate Key
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRevokeKey} className="text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3" />
                    Revoke
                  </Button>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API Endpoint</label>
                  <div className="flex gap-2">
                    <Input className="bg-secondary border-border font-mono text-xs h-11 flex-1" value={API_URL} readOnly />
                    <Button variant="outline" size="icon" onClick={() => copyText(API_URL, "url")} className="h-11 w-11 shrink-0">
                      {copied === "url" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 border border-border/50">
                  <p className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Authentication:</strong> Pass your API key via <code className="font-mono bg-background px-1 py-0.5 rounded text-[10px]">key</code> in the JSON body, or use the <code className="font-mono bg-background px-1 py-0.5 rounded text-[10px]">x-api-key</code> header. All requests use <code className="font-mono bg-background px-1 py-0.5 rounded text-[10px]">POST</code> method.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Endpoint Sections */}
          {(Object.keys(endpoints) as EndpointKey[]).map((key) => {
            const ep = endpoints[key];
            return (
              <div
                key={key}
                ref={(el) => { sectionRefs.current[key] = el; }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono text-[11px] font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">
                      {ep.method}
                    </span>
                    <h3 className="font-semibold text-lg">{ep.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{ep.desc}</p>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {/* Parameters Table */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">Parameters</h4>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Field</th>
                            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                            <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((p, i) => (
                            <tr key={p.name} className={i < ep.params.length - 1 ? "border-b border-border/50" : ""}>
                              <td className="px-4 py-2.5 font-mono text-xs text-primary font-medium">{p.name}</td>
                              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.type}</td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.desc}</td>
                              <td className="px-4 py-2.5 text-center">
                                {p.required ? (
                                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                                ) : (
                                  <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Code Snippets */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">Code Examples</h4>
                    <Tabs defaultValue="curl" className="w-full" onValueChange={setActiveLang}>
                      <div className="flex items-center justify-between mb-2">
                        <TabsList className="h-8 bg-muted p-0.5 rounded-lg">
                          <TabsTrigger value="curl" className="text-[11px] px-3 h-7 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">cURL</TabsTrigger>
                          <TabsTrigger value="python" className="text-[11px] px-3 h-7 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">Python</TabsTrigger>
                          <TabsTrigger value="javascript" className="text-[11px] px-3 h-7 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">JavaScript</TabsTrigger>
                          <TabsTrigger value="php" className="text-[11px] px-3 h-7 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">PHP</TabsTrigger>
                        </TabsList>
                        <Button variant="ghost" size="sm" onClick={() => copyText(generateSnippet(ep, activeLang), `code-${key}`)} className="h-7 text-[11px] gap-1.5 text-muted-foreground">
                          {copied === `code-${key}` ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />} Copy
                        </Button>
                      </div>
                      {["curl", "python", "javascript", "php"].map(lang => (
                        <TabsContent key={lang} value={lang} className="mt-0">
                          <pre className="rounded-xl bg-[hsl(222,47%,8%)] text-[hsl(220,14%,80%)] p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
                            {generateSnippet(ep, lang)}
                          </pre>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>

                  {/* Example Response */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">Response</h4>
                    <pre className="rounded-xl bg-[hsl(222,47%,8%)] text-[hsl(142,70%,60%)] p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
                      {ep.response}
                    </pre>
                  </div>

                  {/* Try It Now */}
                  <div className="border-t border-border/50 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold">Try It Now</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-muted-foreground font-medium mb-1 block">API Key</label>
                        <Input
                          className="bg-secondary border-border font-mono text-xs h-10"
                          placeholder="Paste your API key..."
                          value={testApiKey}
                          onChange={(e) => setTestApiKey(e.target.value)}
                        />
                      </div>

                      {key === "add" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Service ID</label>
                            <Input className="bg-secondary border-border text-xs h-10" placeholder="1" value={testParams.service || ""} onChange={e => setTestParams(p => ({ ...p, service: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Link</label>
                            <Input className="bg-secondary border-border text-xs h-10" placeholder="https://..." value={testParams.link || ""} onChange={e => setTestParams(p => ({ ...p, link: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Quantity</label>
                            <Input className="bg-secondary border-border text-xs h-10" placeholder="1000" value={testParams.quantity || ""} onChange={e => setTestParams(p => ({ ...p, quantity: e.target.value }))} />
                          </div>
                        </div>
                      )}

                      {key === "status" && (
                        <div>
                          <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Order ID</label>
                          <Input className="bg-secondary border-border text-xs h-10" placeholder="12345" value={testParams.order || ""} onChange={e => setTestParams(p => ({ ...p, order: e.target.value }))} />
                        </div>
                      )}

                      <Button
                        onClick={() => handleTest(key)}
                        disabled={testLoading}
                        className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Send Request
                      </Button>

                      {testResponse && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Live Response</span>
                            <Button variant="ghost" size="sm" onClick={() => copyText(testResponse, "test-res")} className="h-6 text-[10px] gap-1 text-muted-foreground">
                              {copied === "test-res" ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />} Copy
                            </Button>
                          </div>
                          <pre className="rounded-xl bg-[hsl(222,47%,8%)] text-[hsl(35,90%,70%)] p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-64 overflow-y-auto">
                            {testResponse}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Error Codes */}
          <div id="error-codes" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
              <h3 className="font-semibold text-lg">Error Codes</h3>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Error</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {errorCodes.map((err, i) => (
                    <tr key={i} className={i < errorCodes.length - 1 ? "border-b border-border/50" : ""}>
                      <td className="px-4 py-2.5 font-mono text-xs text-destructive font-medium">{err.code}</td>
                      <td className="px-4 py-2.5 text-xs font-medium text-foreground">{err.label}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{err.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Start */}
          <div id="quick-start" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <BookOpen className="h-4.5 w-4.5 text-primary" />
              <h3 className="font-semibold text-lg">Quick Start Guide</h3>
            </div>
            <div className="space-y-3">
              {[
                "Generate your API key from the section above — keep it secret!",
                "Add funds to your Smmstable account to begin placing orders.",
                "Fetch the services list to discover available service IDs and pricing.",
                "Place orders using the add action with service ID, link, and quantity.",
                "Track order progress using the status action with your order ID.",
                "Monitor your remaining balance using the balance action.",
                "Rotate your key periodically for security. Old keys are immediately revoked.",
              ].map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="shrink-0 h-6 w-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiPage;
