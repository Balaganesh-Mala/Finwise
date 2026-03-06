"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface TranscriptMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

export interface InterviewSummary {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: "Strong Yes" | "Yes" | "Maybe" | "No";
  summary: string;
  keyHighlights: string[];
}

export type InterviewPhase =
  | "idle"
  | "requesting-permissions"
  | "ready"
  | "ai-speaking"
  | "user-speaking"
  | "processing"
  | "completed"
  | "error";

interface UseInterviewSessionProps {
  interviewId: string;
  candidateName: string;
  jobTitle: string;
  jobDescription?: string;
  candidateEmail?: string;
  candidateId?: number;
  jobId?: number;
}

export function useInterviewSession({
  interviewId,
  candidateName,
  jobTitle,
  jobDescription,
  candidateEmail,
  candidateId,
  jobId,
}: UseInterviewSessionProps) {
  const [phase, setPhase] = useState<InterviewPhase>("idle");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI is speaking
  const [isListening, setIsListening] = useState(false); // User is speaking
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const transcriptRef = useRef<TranscriptMessage[]>([]);
  const questionIndexRef = useRef(0);
  const isEndingRef = useRef(false);
  const elapsedSecondsRef = useRef(0);

  // Keep transcriptRef in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Keep questionIndexRef in sync
  useEffect(() => {
    questionIndexRef.current = questionIndex;
  }, [questionIndex]);

  // Keep elapsedSecondsRef in sync so callbacks always have the latest value
  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Timer
  useEffect(() => {
    if (phase !== "idle" && phase !== "completed" && phase !== "error" && phase !== "requesting-permissions") {
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const addMessage = useCallback((role: "ai" | "user", content: string) => {
    const msg: TranscriptMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setTranscript((prev) => {
      const updated = [...prev, msg];
      transcriptRef.current = updated;
      return updated;
    });
    return msg;
  }, []);

  // Browser TTS fallback using Web Speech API SpeechSynthesis
  const speakWithBrowserTTS = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        // No browser TTS available — just wait a moment and continue
        setTimeout(resolve, 1500);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      // Try to pick a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Alex"))
      ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Don't block on error
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Play TTS audio via Murf API (with browser TTS fallback)
  const speakText = useCallback(
    async (text: string): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          setIsSpeaking(true);
          setPhase("ai-speaking");

          const response = await fetch("/api/interview/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voiceId: "en-US-falcon" }),
          });

          if (!response.ok) {
            // TTS API hard error — fall back to browser TTS
            console.warn("TTS API error, using browser TTS fallback");
            await speakWithBrowserTTS(text);
            setIsSpeaking(false);
            resolve();
            return;
          }

          // Check content type — if JSON, it's a noAudio signal
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const json = await response.json();
            if (json.noAudio) {
              // Use browser TTS as fallback
              await speakWithBrowserTTS(text);
              setIsSpeaking(false);
              resolve();
              return;
            }
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          if (audioRef.current) {
            audioRef.current.pause();
            URL.revokeObjectURL(audioRef.current.src);
          }

          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            // Fall back to browser TTS on audio error
            speakWithBrowserTTS(text).then(resolve);
          };

          await audio.play();
        } catch (err) {
          setIsSpeaking(false);
          // Fall back to browser TTS on any error
          try {
            await speakWithBrowserTTS(text);
            resolve();
          } catch {
            reject(err);
          }
        }
      });
    },
    [speakWithBrowserTTS]
  );

  // Start speech recognition for user input
  const startListening = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        reject(new Error("Speech recognition not supported in this browser"));
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      let finalTranscript = "";
      let silenceTimer: NodeJS.Timeout | null = null;

      const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          recognition.stop();
        }, 3000); // Stop after 3s of silence
      };

      recognition.onstart = () => {
        setIsListening(true);
        setPhase("user-speaking");
        setInterimTranscript("");
        resetSilenceTimer();
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        resetSilenceTimer();
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        setInterimTranscript(interim);
      };

      recognition.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        setIsListening(false);
        setInterimTranscript("");
        const trimmed = finalTranscript.trim();
        if (trimmed) {
          resolve(trimmed);
        } else {
          resolve(""); // Empty response
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        if (silenceTimer) clearTimeout(silenceTimer);
        setIsListening(false);
        setInterimTranscript("");
        if (event.error === "no-speech") {
          resolve(""); // Treat no-speech as empty response
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      recognition.start();
    });
  }, []);

  // Main interview loop: ask question → listen → repeat
  const runInterviewTurn = useCallback(
    async (qIndex: number) => {
      if (isEndingRef.current) return;

      try {
        setPhase("processing");

        // Generate question from Gemini
        const response = await fetch("/api/interview/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobTitle,
            jobDescription,
            candidateName,
            transcript: transcriptRef.current,
            questionIndex: qIndex,
          }),
        });

        if (!response.ok) throw new Error("Failed to generate question");

        const { question, isLastQuestion } = await response.json();
        setCurrentQuestion(question);

        // Add AI message to transcript
        addMessage("ai", question);

        // Speak the question via Murf TTS
        await speakText(question);

        if (isEndingRef.current) return;

        // Listen for user response
        const userResponse = await startListening();

        if (isEndingRef.current) return;

        if (userResponse) {
          addMessage("user", userResponse);
        } else {
          // No response detected — add placeholder
          addMessage("user", "[No response detected]");
        }

        const nextIndex = qIndex + 1;
        setQuestionIndex(nextIndex);

        if (isLastQuestion || nextIndex >= 8) {
          // Interview complete — deliver closing statement
          await deliverClosingStatement();
        } else {
          // Continue to next question
          await runInterviewTurn(nextIndex);
        }
      } catch (err) {
        if (!isEndingRef.current) {
          console.error("Interview turn error:", err);
          setError("An error occurred during the interview. Please try again.");
          setPhase("error");
        }
      }
    },
    [jobTitle, jobDescription, candidateName, addMessage, speakText, startListening]
  );

  const deliverClosingStatement = useCallback(async () => {
    if (isEndingRef.current) return;

    const closingText = `Thank you so much, ${candidateName}! That concludes our interview for the ${jobTitle} position. You've done a great job today. Our team will review your responses and get back to you within a few business days. We appreciate your time and interest in joining us. Have a wonderful day!`;

    addMessage("ai", closingText);
    await speakText(closingText);

    // Complete the interview
    await completeInterview();
  }, [candidateName, jobTitle, addMessage, speakText]);

  const completeInterview = useCallback(async () => {
    isEndingRef.current = true;
    setPhase("processing");

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const response = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          candidateName,
          candidateEmail,
          candidateId,
          jobId,
          jobTitle,
          jobDescription,
          transcript: transcriptRef.current,
          durationSeconds: elapsedSecondsRef.current,
          questionsAsked: questionIndexRef.current,
          status: "completed",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        console.error("Failed to save interview:", await response.text());
      }
    } catch (err) {
      console.error("Failed to save interview:", err);
    }

    setPhase("completed");
  }, [interviewId, candidateName, candidateEmail, candidateId, jobId, jobTitle, jobDescription]);

  // Request camera + mic permissions and start webcam
  const requestPermissions = useCallback(async () => {
    setPhase("requesting-permissions");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setPhase("ready");
      return stream;
    } catch (err) {
      console.error("Permission error:", err);
      setError("Camera and microphone access is required for the interview. Please allow permissions and try again.");
      setPhase("error");
      return null;
    }
  }, []);

  // Start the interview
  const startInterview = useCallback(async () => {
    isEndingRef.current = false;
    setTranscript([]);
    setQuestionIndex(0);
    setElapsedSeconds(0);
    setSummary(null);
    setError(null);
    transcriptRef.current = [];
    questionIndexRef.current = 0;
    elapsedSecondsRef.current = 0;

    await runInterviewTurn(0);
  }, [runInterviewTurn]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted; // Toggle
      });
      setIsMuted((prev) => !prev);
    }
  }, [isMuted]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isCameraOff; // Toggle
      });
      setIsCameraOff((prev) => !prev);
    }
  }, [isCameraOff]);

  // End call manually
  const endCall = useCallback(async () => {
    isEndingRef.current = true;

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsSpeaking(false);
    setIsListening(false);

    if (timerRef.current) clearInterval(timerRef.current);

    // Save what we have so far
    if (transcriptRef.current.length > 0) {
      try {
        const response = await fetch("/api/interview/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId,
            candidateName,
            candidateEmail,
            candidateId,
            jobId,
            jobTitle,
            jobDescription,
            transcript: transcriptRef.current,
            durationSeconds: elapsedSecondsRef.current,
            questionsAsked: questionIndexRef.current,
            status: "abandoned",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
        } else {
          console.error("Failed to save abandoned interview:", await response.text());
        }
      } catch (err) {
        console.error("Failed to save abandoned interview:", err);
      }
    }

    setPhase("completed");
  }, [interviewId, candidateName, candidateEmail, candidateId, jobId, jobTitle, jobDescription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isEndingRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioRef.current) audioRef.current.pause();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    // State
    phase,
    transcript,
    currentQuestion,
    questionIndex,
    isMuted,
    isCameraOff,
    isSpeaking,
    isListening,
    elapsedSeconds,
    summary,
    error,
    interimTranscript,
    // Refs
    videoRef,
    // Actions
    requestPermissions,
    startInterview,
    toggleMute,
    toggleCamera,
    endCall,
  };
}
