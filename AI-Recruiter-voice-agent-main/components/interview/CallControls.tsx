"use client";

import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  disabled?: boolean;
}

export function CallControls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  disabled = false,
}: CallControlsProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleEndCallClick = () => {
    setShowEndConfirm(true);
  };

  const handleConfirmEnd = () => {
    setShowEndConfirm(false);
    onEndCall();
  };

  return (
    <>
      <div className="flex items-center justify-center gap-3">
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          disabled={disabled}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed ${
            isMuted
              ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEndCallClick}
          disabled={disabled}
          title="End interview"
          className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PhoneOff className="w-6 h-6" />
        </button>

        {/* Camera Button */}
        <button
          onClick={onToggleCamera}
          disabled={disabled}
          title={isCameraOff ? "Turn on camera" : "Turn off camera"}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed ${
            isCameraOff
              ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
        >
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      </div>

      {/* End Call Confirmation Dialog */}
      <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <DialogContent className="bg-[#0f0f1f] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle className="text-white">End Interview?</DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm leading-relaxed">
              Are you sure you want to end the interview early? Your responses so far will be saved and reviewed by the hiring team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowEndConfirm(false)}
              className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Continue Interview
            </Button>
            <Button
              onClick={handleConfirmEnd}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white border-0"
            >
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
