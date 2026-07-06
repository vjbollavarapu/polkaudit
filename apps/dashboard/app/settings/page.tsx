"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getApiBase,
  getApiKeyOverride,
  getApiKeyStatus,
  getEffectiveApiKey,
  setApiKeyOverride,
  fetchHealth,
} from "@/lib/api";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Server,
  Key,
  Info,
} from "lucide-react";

const APP_VERSION = "1.0.0";
const DEV_API_KEY_HINT = "dev-secret-key";

function EnvironmentInfo() {
  const apiBase = getApiBase();
  const env = process.env.NODE_ENV === "production" ? "Production" : "Development";
  const keyStatus = getApiKeyStatus();

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Server className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Environment Information</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Values loaded from <code className="text-xs">.env.local</code> (read-only here).
        Edit the API key in the panel on the right.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">API Base URL</Label>
          <div className="rounded-md bg-muted px-3 py-2">
            <code className="text-sm">{apiBase}</code>
          </div>
        </div>

        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">API Key (from env)</Label>
          <div className="rounded-md bg-muted px-3 py-2">
            <code className="text-sm">
              {keyStatus.hasEnvKey ? "Configured in .env.local" : "Not set — use custom key →"}
            </code>
          </div>
        </div>

        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">App Version</Label>
          <div className="rounded-md bg-muted px-3 py-2">
            <code className="text-sm">{APP_VERSION}</code>
          </div>
        </div>

        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Environment</Label>
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
              env === "Production"
                ? "bg-success/20 text-success"
                : "bg-warning/20 text-warning"
            }`}
          >
            {env}
          </span>
        </div>
      </div>
    </div>
  );
}

function ApiKeySettings() {
  const [apiKey, setApiKey] = useState("");
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const override = getApiKeyOverride();
    const envKey = process.env.NEXT_PUBLIC_API_KEY || "";
    if (override.enabled && override.key) {
      setApiKey(override.key);
      setUseCustomKey(true);
    } else if (envKey) {
      setApiKey(envKey);
      setUseCustomKey(false);
    } else {
      setApiKey("");
      setUseCustomKey(true);
    }
  }, []);

  const handleSave = () => {
    if (useCustomKey && !apiKey.trim()) {
      toast.error("Enter an API key or turn off custom key mode");
      return;
    }
    setApiKeyOverride(useCustomKey ? apiKey.trim() : "", useCustomKey);
    setSaved(true);
    toast.success(
      useCustomKey
        ? "Custom API key saved"
        : "Using API key from .env.local"
    );
    setTimeout(() => setSaved(false), 2000);
  };

  const applyDevDefault = () => {
    setApiKey(DEV_API_KEY_HINT);
    setUseCustomKey(true);
    toast.message("Development key filled — click Save Settings");
  };

  const status = getApiKeyStatus();
  const activeKey = getEffectiveApiKey();

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">API Connection</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Must match <code className="text-xs">API_KEY</code> in{" "}
        <code className="text-xs">apps/backend/.env</code>.
      </p>

      <div className="mt-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
        {activeKey ? (
          <span className="text-success">Active key configured</span>
        ) : (
          <span className="text-destructive">No active API key — requests may fail</span>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="api-key-custom">Use custom API key</Label>
            <p className="text-xs text-muted-foreground">
              Off = use <code className="text-xs">.env.local</code>
              {status.hasEnvKey ? " (configured)" : " (not set)"}
            </p>
          </div>
          <Switch
            id="api-key-custom"
            checked={useCustomKey}
            onCheckedChange={setUseCustomKey}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="text"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={DEV_API_KEY_HINT}
            readOnly={!useCustomKey && !!status.hasEnvKey}
            className={!useCustomKey && status.hasEnvKey ? "opacity-80" : ""}
          />
          <p className="text-xs text-muted-foreground">
            {useCustomKey
              ? "Editable — stored in your browser only."
              : status.hasEnvKey
                ? "Using env key. Turn on custom key to type a different value."
                : "Turn on custom key or add NEXT_PUBLIC_API_KEY to .env.local."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={applyDevDefault}>
            Fill dev key
          </Button>
          <Button type="button" onClick={handleSave} disabled={saved}>
            {saved ? "Saved" : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConnectionTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const testConnection = async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetchHealth();
      setStatus("success");
      setMessage(`Backend reachable (${response.status || "ok"})`);
      toast.success("Connection test successful");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Connection failed");
      toast.error("Connection test failed");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Connection Test</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Checks backend health at <code className="text-xs">/health</code> (no API key required).
      </p>

      <div className="mt-6 space-y-4">
        <Button
          type="button"
          onClick={testConnection}
          disabled={status === "loading"}
          variant="outline"
          className="gap-2 bg-transparent"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : status === "error" ? (
            <XCircle className="h-4 w-4 text-destructive" />
          ) : null}
          Test Connection
        </Button>

        {message && (
          <div
            className={`rounded-md p-3 text-sm ${
              status === "success"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <Topbar title="Settings" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Portal Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure API access. Environment URL is read-only; API key can be edited on the right.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <EnvironmentInfo />
            <ConnectionTest />
          </div>
          <div>
            <ApiKeySettings />
          </div>
        </div>
      </div>
    </div>
  );
}
