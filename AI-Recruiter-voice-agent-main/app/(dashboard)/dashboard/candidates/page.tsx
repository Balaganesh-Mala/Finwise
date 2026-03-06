"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Loader2,
    Plus,
    Upload,
    UserRound,
    Search,
    LayoutGrid,
    List as ListIcon,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Candidate = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    location: string | null;
    currentTitle: string | null;
    currentCompany: string | null;
    status: string | null;
    skills: string | null;
    createdAt: string;
};

type CandidateFormState = {
    name: string;
    email: string;
    phone: string;
    location: string;
    currentTitle: string;
    currentCompany: string;
    linkedinUrl: string;
    portfolioUrl: string;
    experienceYears: string;
    skills: string;
    strengths: string;
    weaknesses: string;
    tags: string;
    notes: string;
    aiSummary: string;
    resumeText: string;
    resumeFileName: string;
};

const initialForm: CandidateFormState = {
    name: "",
    email: "",
    phone: "",
    location: "",
    currentTitle: "",
    currentCompany: "",
    linkedinUrl: "",
    portfolioUrl: "",
    experienceYears: "",
    skills: "",
    strengths: "",
    weaknesses: "",
    tags: "",
    notes: "",
    aiSummary: "",
    resumeText: "",
    resumeFileName: "",
};

const statusStyles: Record<string, string> = {
    new: "bg-muted text-muted-foreground border-border",
    reviewing: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
    shortlisted: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
    interviewing: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30",
    offered: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
    hired: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
    rejected: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
};

const ITEMS_PER_PAGE = 9;

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [analyzingResume, setAnalyzingResume] = useState(false);
    const [form, setForm] = useState<CandidateFormState>(initialForm);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/candidates", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to fetch candidates");
            }

            setCandidates(data.candidates || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load candidates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const onChange = (field: keyof CandidateFormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAnalyzeResume = async (file: File) => {
        try {
            setAnalyzingResume(true);

            const formData = new FormData();
            formData.append("resume", file);

            const response = await fetch("/api/candidates/analyze-resume", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || "Failed to analyze resume");
            }

            const a = data.analysis || {};
            setForm((prev) => ({
                ...prev,
                name: a.name ?? prev.name,
                email: a.email ?? prev.email,
                phone: a.phone ?? prev.phone,
                location: a.location ?? prev.location,
                currentTitle: a.currentTitle ?? prev.currentTitle,
                currentCompany: a.currentCompany ?? prev.currentCompany,
                linkedinUrl: a.linkedinUrl ?? prev.linkedinUrl,
                portfolioUrl: a.portfolioUrl ?? prev.portfolioUrl,
                experienceYears: a.experienceYears ?? prev.experienceYears,
                skills: Array.isArray(a.skills) ? a.skills.join(", ") : prev.skills,
                strengths: Array.isArray(a.strengths) ? a.strengths.join(", ") : prev.strengths,
                weaknesses: Array.isArray(a.weaknesses) ? a.weaknesses.join(", ") : prev.weaknesses,
                aiSummary: a.aiSummary ?? prev.aiSummary,
                resumeText: a.resumeText ?? prev.resumeText,
                resumeFileName: a.resumeFileName ?? file.name,
            }));

            toast.success("Resume analyzed. Form auto-filled.");
        } catch (error) {
            console.error(error);
            toast.error("Could not analyze resume. You can fill details manually.");
        } finally {
            setAnalyzingResume(false);
        }
    };

    const handleSaveCandidate = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            toast.error("Name and email are required");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch("/api/candidates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    location: form.location,
                    currentTitle: form.currentTitle,
                    currentCompany: form.currentCompany,
                    linkedinUrl: form.linkedinUrl,
                    portfolioUrl: form.portfolioUrl,
                    experienceYears: form.experienceYears,
                    skills: form.skills,
                    strengths: form.strengths,
                    weaknesses: form.weaknesses,
                    tags: form.tags,
                    notes: form.notes,
                    aiSummary: form.aiSummary,
                    resumeText: form.resumeText,
                    resumeFileName: form.resumeFileName,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || "Failed to save candidate");
            }

            toast.success("Candidate added successfully");
            setOpen(false);
            setForm(initialForm);
            await fetchCandidates();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save candidate");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCandidate = async (id: number) => {
        try {
            setDeletingId(id);
            const response = await fetch(`/api/candidates/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete candidate");
            }

            setCandidates((prev) => prev.filter((c) => c.id !== id));
            toast.success("Candidate deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete candidate");
        } finally {
            setDeletingId(null);
        }
    };

    // Filter logic
    const filteredCandidates = useMemo(() => {
        return candidates.filter((candidate) => {
            const query = searchQuery.toLowerCase();
            return (
                candidate.name.toLowerCase().includes(query) ||
                candidate.email.toLowerCase().includes(query) ||
                candidate.currentTitle?.toLowerCase().includes(query) ||
                candidate.currentCompany?.toLowerCase().includes(query)
            );
        });
    }, [candidates, searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
    const paginatedCandidates = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCandidates.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCandidates, currentPage]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Candidates</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your talent pool and track applications.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Dialog
                        open={open}
                        onOpenChange={(value) => {
                            setOpen(value);
                            if (!value) setForm(initialForm);
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/20">
                                <Plus className="size-4" />
                                Add Candidate
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add Candidate</DialogTitle>
                                <DialogDescription>
                                    Upload a resume for AI autofill, then review and edit manually before saving.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5">
                                <div className="rounded-lg border p-4 bg-muted/50">
                                    <Label htmlFor="resume" className="mb-2 block text-sm font-medium">
                                        Upload Resume (optional)
                                    </Label>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <Input
                                            id="resume"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleAnalyzeResume(file);
                                                }
                                            }}
                                            disabled={analyzingResume}
                                        />
                                        {analyzingResume && (
                                            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                                <Loader2 className="size-3.5 animate-spin" />
                                                AI analyzing resume...
                                            </div>
                                        )}
                                    </div>

                                    {form.resumeFileName && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-violet-500">
                                            <Upload className="size-3" />
                                            {form.resumeFileName}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Name *</Label>
                                        <Input value={form.name} onChange={(e) => onChange("name", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Email *</Label>
                                        <Input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Phone</Label>
                                        <Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Location</Label>
                                        <Input value={form.location} onChange={(e) => onChange("location", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Current Title</Label>
                                        <Input value={form.currentTitle} onChange={(e) => onChange("currentTitle", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Current Company</Label>
                                        <Input value={form.currentCompany} onChange={(e) => onChange("currentCompany", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>LinkedIn URL</Label>
                                        <Input value={form.linkedinUrl} onChange={(e) => onChange("linkedinUrl", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Portfolio URL</Label>
                                        <Input value={form.portfolioUrl} onChange={(e) => onChange("portfolioUrl", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Experience (years)</Label>
                                        <Input value={form.experienceYears} onChange={(e) => onChange("experienceYears", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Skills (comma separated)</Label>
                                        <Input value={form.skills} onChange={(e) => onChange("skills", e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>AI Summary</Label>
                                    <Textarea value={form.aiSummary} onChange={(e) => onChange("aiSummary", e.target.value)} rows={3} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Strengths (comma separated)</Label>
                                        <Textarea value={form.strengths} onChange={(e) => onChange("strengths", e.target.value)} rows={3} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Weaknesses (comma separated)</Label>
                                        <Textarea value={form.weaknesses} onChange={(e) => onChange("weaknesses", e.target.value)} rows={3} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Tags (comma separated)</Label>
                                        <Input value={form.tags} onChange={(e) => onChange("tags", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Notes</Label>
                                        <Input value={form.notes} onChange={(e) => onChange("notes", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleSaveCandidate} disabled={saving || analyzingResume} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white">
                                    {saving ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="size-4 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Candidate"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Controls Section: Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </div>

                <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/20">
                    <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8 p-0"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 w-8 p-0"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Candidates List/Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm">Loading candidates...</p>
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="py-20 text-center border rounded-lg bg-card border-dashed">
                    <div className="mx-auto mb-4 size-12 rounded-full bg-muted flex items-center justify-center">
                        <UserRound className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        {searchQuery
                            ? "Try adjusting your search terms."
                            : "Get started by adding your first candidate to the platform."}
                    </p>
                    {!searchQuery && (
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setOpen(true)}
                        >
                            <Plus className="size-4 mr-2" />
                            Add Candidate
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {paginatedCandidates.map((candidate) => {
                                const parsedSkills = candidate.skills ? JSON.parse(candidate.skills) as string[] : [];
                                return (
                                    <Card key={candidate.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <Link href={`/dashboard/candidates/${candidate.id}`} className="hover:underline">
                                                            <h3 className="font-semibold text-base truncate">{candidate.name}</h3>
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{candidate.email}</p>
                                                    </div>
                                                    <Badge className={`text-[10px] whitespace-nowrap border ${statusStyles[candidate.status || "new"] || statusStyles.new}`}>
                                                        {candidate.status || "new"}
                                                    </Badge>
                                                </div>

                                                {candidate.currentTitle && (
                                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                                                        {candidate.currentTitle}
                                                        {candidate.currentCompany ? ` @ ${candidate.currentCompany}` : ""}
                                                    </p>
                                                )}

                                                {parsedSkills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {parsedSkills.slice(0, 3).map((skill) => (
                                                            <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                        {parsedSkills.length > 3 && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                                +{parsedSkills.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-4 border-t mt-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        Added {new Date(candidate.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the candidate
                                                                        and all associated data.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteCandidate(candidate.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        {deletingId === candidate.id ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            "Delete"
                                                                        )}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>

                                                        <Link href={`/dashboard/candidates/${candidate.id}`}>
                                                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="border rounded-lg bg-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCandidates.map((candidate) => (
                                        <TableRow key={candidate.id}>
                                            <TableCell>
                                                <div>
                                                    <Link href={`/dashboard/candidates/${candidate.id}`} className="font-medium hover:underline block">
                                                        {candidate.name}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground">{candidate.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {candidate.currentTitle || "N/A"}
                                                    {candidate.currentCompany && (
                                                        <span className="text-muted-foreground block text-xs">{candidate.currentCompany}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-[10px] whitespace-nowrap border ${statusStyles[candidate.status || "new"] || statusStyles.new}`}>
                                                    {candidate.status || "new"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(candidate.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Link href={`/dashboard/candidates/${candidate.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete {candidate.name}? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteCandidate(candidate.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground mx-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
