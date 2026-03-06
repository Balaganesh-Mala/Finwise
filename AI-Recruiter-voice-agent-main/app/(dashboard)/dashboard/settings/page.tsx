"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Mail,
  Bell,
  Building2,
  Save,
  Loader2,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Types ─────────────────────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  screeningQuestionsCount: 6,
  techQuestionsCount: 8,
  hrQuestionsCount: 5,
  silenceTimeoutSeconds: 3,
  autoEndInterview: true,
  aiVoiceId: "en-US-falcon",
  aiInterviewerName: "Alex",
  interviewTone: "professional",
  screeningPrompt: "",
  techPrompt: "",
  hrPrompt: "",
  closingMessage: "",
  evaluationStrictness: "balanced",
  companyName: "",
  recruiterDisplayName: "",
  customEmailSubject: "",
  customEmailIntro: "",
  replyToEmail: "",
  inviteExpiryDays: 7,
  companyLogoUrl: "",
  notifyOnComplete: true,
  notificationEmail: "",
  lowScoreAlert: false,
  lowScoreThreshold: 5,
  industry: "",
  defaultLocation: "",
  defaultCurrency: "USD",
  timezone: "UTC",
};

type SettingsState = typeof DEFAULT_SETTINGS;

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* fetch on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ── Page ── */
  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="size-6" />
              Settings
            </h1>
            <p className="text-purple-100 text-sm mt-1">
              Configure your AI recruiter agent, email templates, and notifications.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="company">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted rounded-xl gap-1">
          <TabsTrigger
            value="company"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
          >
            <Building2 className="size-4" />
            Company
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
          >
            <Bot className="size-4" />
            AI Interview
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
          >
            <Mail className="size-4" />
            Email &amp; Invites
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
          >
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1 — Company Profile
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <Building2 className="size-4 text-purple-600" />
                </div>
                Company Profile
              </CardTitle>
              <CardDescription>
                Basic information about your company used across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Company Name</Label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Recruiter Display Name</Label>
                <Input
                  value={settings.recruiterDisplayName}
                  onChange={(e) => update("recruiterDisplayName", e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input
                  value={settings.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  placeholder="Technology"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Default Location</Label>
                <Input
                  value={settings.defaultLocation}
                  onChange={(e) => update("defaultLocation", e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Default Currency</Label>
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={(v) => update("defaultCurrency", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound</SelectItem>
                    <SelectItem value="CAD">CAD — Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                    <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(v) => update("timezone", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                    <SelectItem value="America/Denver">America/Denver</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Company Logo URL</Label>
                <Input
                  value={settings.companyLogoUrl}
                  onChange={(e) => update("companyLogoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2 — AI Interview Settings
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="ai" className="mt-4 space-y-4">
          {/* Agent Personality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Bot className="size-4 text-blue-600" />
                </div>
                Agent Personality
              </CardTitle>
              <CardDescription>
                Define how your AI interviewer presents itself to candidates.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>AI Interviewer Name</Label>
                <Input
                  value={settings.aiInterviewerName}
                  onChange={(e) => update("aiInterviewerName", e.target.value)}
                  placeholder="Alex"
                />
              </div>
              <div className="space-y-1.5">
                <Label>AI Voice</Label>
                <Select
                  value={settings.aiVoiceId}
                  onValueChange={(v) => update("aiVoiceId", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US-falcon">en-US-falcon (Default)</SelectItem>
                    <SelectItem value="en-US-nova">en-US-nova</SelectItem>
                    <SelectItem value="en-US-echo">en-US-echo</SelectItem>
                    <SelectItem value="en-GB-aria">en-GB-aria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Interview Tone</Label>
                <Select
                  value={settings.interviewTone}
                  onValueChange={(v) => update("interviewTone", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Evaluation Strictness</Label>
                <Select
                  value={settings.evaluationStrictness}
                  onValueChange={(v) => update("evaluationStrictness", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="lenient">Lenient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Question Counts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Counts</CardTitle>
              <CardDescription>
                Set how many questions the AI asks in each interview phase.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Screening Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.screeningQuestionsCount}
                  onChange={(e) =>
                    update("screeningQuestionsCount", Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">Recommended: 4–8</p>
              </div>
              <div className="space-y-1.5">
                <Label>Technical Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.techQuestionsCount}
                  onChange={(e) =>
                    update("techQuestionsCount", Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">Recommended: 6–10</p>
              </div>
              <div className="space-y-1.5">
                <Label>HR Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.hrQuestionsCount}
                  onChange={(e) =>
                    update("hrQuestionsCount", Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">Recommended: 3–6</p>
              </div>
            </CardContent>
          </Card>

          {/* Timing & Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timing &amp; Behavior</CardTitle>
              <CardDescription>
                Control how the AI handles pauses and session endings.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Silence Timeout (seconds)</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.silenceTimeoutSeconds}
                  onChange={(e) =>
                    update("silenceTimeoutSeconds", Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How long to wait before prompting the candidate again.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">Auto-end Interview</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatically end the call when all questions are answered.
                  </p>
                </div>
                <Switch
                  checked={settings.autoEndInterview}
                  onCheckedChange={(v) => update("autoEndInterview", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom AI Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom AI Prompts</CardTitle>
              <CardDescription>
                Add extra instructions for each interview phase. Leave blank to use defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Screening Prompt</Label>
                <Textarea
                  rows={3}
                  value={settings.screeningPrompt}
                  onChange={(e) => update("screeningPrompt", e.target.value)}
                  placeholder="Additional instructions for the screening phase..."
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>Technical Prompt</Label>
                <Textarea
                  rows={3}
                  value={settings.techPrompt}
                  onChange={(e) => update("techPrompt", e.target.value)}
                  placeholder="Additional instructions for the technical phase..."
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>HR Prompt</Label>
                <Textarea
                  rows={3}
                  value={settings.hrPrompt}
                  onChange={(e) => update("hrPrompt", e.target.value)}
                  placeholder="Additional instructions for the HR phase..."
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>Closing Message</Label>
                <Textarea
                  rows={2}
                  value={settings.closingMessage}
                  onChange={(e) => update("closingMessage", e.target.value)}
                  placeholder="Message to read at the end of the interview..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3 — Email & Invite Settings
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="email" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Mail className="size-4 text-green-600" />
                </div>
                Email &amp; Invite Settings
              </CardTitle>
              <CardDescription>
                Customize the emails and invite links sent to candidates.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Reply-To Email</Label>
                <Input
                  type="email"
                  value={settings.replyToEmail}
                  onChange={(e) => update("replyToEmail", e.target.value)}
                  placeholder="recruiter@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Invite Expiry (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.inviteExpiryDays}
                  onChange={(e) =>
                    update("inviteExpiryDays", Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How long the interview link stays valid after sending.
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Custom Email Subject</Label>
                <Input
                  value={settings.customEmailSubject}
                  onChange={(e) => update("customEmailSubject", e.target.value)}
                  placeholder="You've been invited to interview at {{company}}"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Custom Email Intro</Label>
                <Textarea
                  rows={4}
                  value={settings.customEmailIntro}
                  onChange={(e) => update("customEmailIntro", e.target.value)}
                  placeholder="We're excited to invite you to the next stage of our hiring process..."
                />
                <p className="text-xs text-muted-foreground">
                  This text appears at the top of the invite email body.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4 — Notifications
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10">
                  <Bell className="size-4 text-orange-600" />
                </div>
                Notifications
              </CardTitle>
              <CardDescription>
                Choose when and how you receive alerts about interview activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Notify on complete */}
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">Notify on Interview Complete</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Receive an email when a candidate finishes their interview.
                  </p>
                </div>
                <Switch
                  checked={settings.notifyOnComplete}
                  onCheckedChange={(v) => update("notifyOnComplete", v)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Notification Email</Label>
                <Input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => update("notificationEmail", e.target.value)}
                  placeholder="alerts@company.com"
                />
                <p className="text-xs text-muted-foreground">
                  Where interview completion alerts will be sent.
                </p>
              </div>

              <Separator />

              {/* Low score alert */}
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">Low Score Alert</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get notified when a candidate scores below the threshold.
                  </p>
                </div>
                <Switch
                  checked={settings.lowScoreAlert}
                  onCheckedChange={(v) => update("lowScoreAlert", v)}
                />
              </div>

              {settings.lowScoreAlert && (
                <div className="space-y-1.5">
                  <Label>Low Score Threshold (out of 10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.lowScoreThreshold}
                    onChange={(e) =>
                      update("lowScoreThreshold", Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll be alerted when a candidate's overall score is at or below this value.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Bottom save button ── */}
      <div className="flex justify-end pb-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <Save className="size-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
