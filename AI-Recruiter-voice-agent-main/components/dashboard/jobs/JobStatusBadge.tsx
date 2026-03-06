import { Badge } from "@/components/ui/badge";

type JobStatus = "active" | "draft" | "closed";

interface JobStatusBadgeProps {
    status: JobStatus | string;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
    const getVariant = (s: string) => {
        switch (s) {
            case "active":
                return "default";
            case "draft":
                return "secondary";
            case "closed":
                return "destructive";
            default:
                return "outline";
        }
    };

    const getLabel = (s: string) => {
        switch (s) {
            case "active":
                return "Active";
            case "draft":
                return "Draft";
            case "closed":
                return "Expired";
            default:
                return s;
        }
    };

    const getClassName = (s: string) => {
        if (s === "active") return "bg-emerald-500 hover:bg-emerald-600 border-transparent text-primary-foreground";
        return "";
    };

    return (
        <Badge variant={getVariant(status)} className={getClassName(status as string)}>
            {getLabel(status as string)}
        </Badge>
    );
}
