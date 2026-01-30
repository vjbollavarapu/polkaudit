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

function EnvironmentInfo() {
  const apiBase = getApiBase();
  const env = process.env.NODE_ENV === "production" ? "Production" : "Development";

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Server className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Environment Information</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Read-only configuration values from your environment.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">API Base URL</Label>
          <div className="rounded-md bg-muted px-3 py-2">
            <code className="text-sm">{apiBase}</code>
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
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
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
    </div>
  );
}

function ApiKeySettings() {
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const override = getApiKeyOverride();
    setApiKey(override.key);
    setEnabled(override.enabled);
  }, []);

  const handleSave = () => {
    setApiKeyOverride(apiKey, enabled);
    setSaved(true);
    toast.success("API key settings saved");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">API Key Override</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Override the default API key with a custom value. This is stored in your browser only.
      </p>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="api-key-enabled">Enable API key override</Label>
          <Switch
            id="api-key-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground">
            This key will be used for all API requests when enabled.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saved}>
          {saved ? "Saved" : "Save Settings"}
        </Button>
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
      setMessage(`Connected successfully. API version: ${response.version || "unknown"}`);
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
        Test the connection to the backend API.
      </p>

      <div className="mt-6 space-y-4">
        <Button
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
            Configure your portal connection and view environment details.
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
