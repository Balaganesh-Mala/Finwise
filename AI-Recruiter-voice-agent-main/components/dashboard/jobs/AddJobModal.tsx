"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobForm, JobFormValues } from "./JobForm";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export function AddJobModal() {
    const [open, setOpen] = useState(false);
    const [jobTitle, setJobTitle] = useState("");
    const [generating, setGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState<Partial<JobFormValues>>({});

    const handleGenerate = async () => {
        if (!jobTitle.trim()) {
            toast.error("Please enter a job title");
            return;
        }

        setGenerating(true);
        try {
            const response = await fetch("/api/jobs/ai-writer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobTitle }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate job details");
            }

            const data = await response.json();
            const jobDetails = data.jobDetails;

            // Transform array skills to string if needed
            let skills = jobDetails.skills;
            if (Array.isArray(skills)) {
                skills = skills.join(", ");
            }

            setGeneratedData({
                title: jobTitle,
                ...jobDetails,
                skills: skills,
                status: "draft",
            });

            toast.success("Job details generated! Please review below.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate job details");
        } finally {
            setGenerating(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setJobTitle("");
        setGeneratedData({});
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/20">
                    <Plus className="h-4 w-4" />
                    Add New Job
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Job</DialogTitle>
                    <DialogDescription>
                        Use AI to auto-fill details or enter them manually.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {/* AI Section */}
                    <div className="rounded-xl border border-dashed border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">AI Auto-fill</p>
                                <p className="text-xs text-muted-foreground">Enter a job title and let AI generate the details</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    id="ai-title"
                                    placeholder="e.g. Senior React Engineer, Product Manager..."
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                    className="bg-background"
                                />
                            </div>
                            <Button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 gap-2"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground font-medium">JOB DETAILS</span>
                        <Separator className="flex-1" />
                    </div>

                    {/* Manual Form Section */}
                    <div className="pb-2">
                        <JobForm
                            key={JSON.stringify(generatedData)}
                            initialData={generatedData}
                            onSuccess={handleClose}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
