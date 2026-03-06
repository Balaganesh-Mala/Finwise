import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Get started free</h1>
                    <p className="text-gray-400">Create your RecruitAI account today</p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-[#12122a] border border-white/10 shadow-2xl",
                            headerTitle: "text-white",
                            headerSubtitle: "text-gray-400",
                            socialButtonsBlockButton:
                                "bg-white/5 border border-white/10 text-white hover:bg-white/10",
                            socialButtonsBlockButtonText: "text-white font-medium",
                            dividerLine: "bg-white/10",
                            dividerText: "text-gray-400",
                            formFieldLabel: "text-gray-300",
                            formFieldInput:
                                "bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500",
                            formButtonPrimary:
                                "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold",
                            footerActionLink: "text-purple-400 hover:text-purple-300",
                            identityPreviewText: "text-white",
                            identityPreviewEditButton: "text-purple-400",
                            formFieldInputShowPasswordButton: "text-gray-400",
                            alertText: "text-red-400",
                            formResendCodeLink: "text-purple-400",
                        },
                        variables: {
                            colorPrimary: "#7c3aed",
                            colorBackground: "#12122a",
                            colorText: "#ffffff",
                            colorTextSecondary: "#9ca3af",
                            colorInputBackground: "rgba(255,255,255,0.05)",
                            colorInputText: "#ffffff",
                            borderRadius: "0.75rem",
                        },
                    }}
                />
            </div>
        </div>
    );
}
