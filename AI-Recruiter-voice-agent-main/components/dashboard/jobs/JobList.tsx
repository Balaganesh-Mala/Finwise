import { JobCard } from "./JobCard";
import { Briefcase } from "lucide-react";

interface Job {
    id: number;
    title: string;
    department?: string;
    location?: string;
    type?: string;
    experienceLevel?: string;
    salaryMin?: string;
    salaryMax?: string;
    salaryCurrency?: string;
    status?: string;
    matchedCandidates?: string;
    createdAt: string;
}

interface JobListProps {
    jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl bg-card">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Briefcase className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No job postings yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
                    Create your first job posting to start finding the best candidates with AI.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{jobs.length}</span> job{jobs.length !== 1 ? "s" : ""}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                    />
                ))}
            </div>
        </div>
    );
}
