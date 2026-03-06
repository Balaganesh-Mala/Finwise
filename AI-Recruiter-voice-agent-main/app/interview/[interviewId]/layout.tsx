import { InterviewHeader } from "@/components/interview/InterviewHeader";

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <InterviewHeader />
      <main className="pt-16">{children}</main>
    </div>
  );
}
