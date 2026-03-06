import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Mail, Users, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SendInviteModalProps {
    selectedCandidates: number[];
    jobId: number;
    onBack: () => void;
    onClose: () => void;
}

const interviewLabels: Record<string, string> = {
    screening: "Screening Call",
    tech: "Technical Interview",
    hr: "HR / Final Interview",
};

const SendInviteModal: React.FC<SendInviteModalProps> = ({
    selectedCandidates,
    jobId,
    onBack,
    onClose,
}) => {
    const router = useRouter();
    const [interviewType, setInterviewType] = useState<"screening" | "tech" | "hr">("screening");
    const [sending, setSending] = useState(false);
    const [alreadyInvitedWarning, setAlreadyInvitedWarning] = useState(false);

    const handleSendInvite = async (forceResend = false) => {
        setSending(true);
        setAlreadyInvitedWarning(false);
        try {
            const response = await fetch("/api/candidates/send-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    candidateIds: selectedCandidates,
                    jobId,
                    interviewType,
                    forceResend,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle "already invited" case — offer resend option
                if (response.status === 400 && data?.canForceResend) {
                    setAlreadyInvitedWarning(true);
                    return;
                }
                throw new Error(data?.error || "Failed to send invites");
            }

            const { results } = data;
            if (results.sent > 0) {
                toast.success(
                    `Invite${results.sent !== 1 ? "s" : ""} sent to ${results.sent} candidate${results.sent !== 1 ? "s" : ""}` +
                    (results.alreadyInvited > 0 ? ` (${results.alreadyInvited} skipped — already invited)` : "")
                );
            }
            if (results.failed > 0) {
                toast.warning(`${results.failed} invite${results.failed !== 1 ? "s" : ""} failed to send`);
            }

            onClose();
            router.refresh();
        } catch (error) {
            console.error("Error sending invites:", error);
            toast.error(error instanceof Error ? error.message : "Failed to send invites. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8 shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Send Interview Invites
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Sending to{" "}
                        <span className="font-medium text-foreground">
                            {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""}
                        </span>
                    </p>
                </div>
            </div>

            {/* Already Invited Warning */}
            {alreadyInvitedWarning && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            Already Invited
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            All selected candidates have already received an invite for this job. Would you like to resend?
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                onClick={() => handleSendInvite(true)}
                                disabled={sending}
                                className="h-7 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {sending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3 w-3" />
                                )}
                                Resend Anyway
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setAlreadyInvitedWarning(false)}
                                className="h-7 text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Candidate Count Banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
                <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Each will receive a unique AI interview link via email
                    </p>
                </div>
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
                <Label htmlFor="interview-type" className="text-sm font-medium">
                    Interview Type
                </Label>
                <Select
                    value={interviewType}
                    onValueChange={(val: any) => setInterviewType(val)}
                >
                    <SelectTrigger id="interview-type">
                        <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="screening">Screening Call</SelectItem>
                        <SelectItem value="tech">Technical Interview</SelectItem>
                        <SelectItem value="hr">HR / Final Interview</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    A unique AI-powered interview link will be generated for each candidate.
                </p>
            </div>

            {/* Email Preview */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        Email Preview
                    </span>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                    &ldquo;Hi [Candidate Name], we&apos;d like to invite you to a{" "}
                    <span className="font-medium text-foreground not-italic">
                        {interviewLabels[interviewType]}
                    </span>{" "}
                    for the [Job Title] position. Please click the link below to start your
                    AI-powered interview at your convenience...&rdquo;
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    Cancel
                </Button>
                <Button
                    onClick={() => handleSendInvite(false)}
                    disabled={sending}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white min-w-[140px]"
                >
                    {sending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Mail className="h-4 w-4" />
                            Send Invites
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default SendInviteModal;
