import React, { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Video, StopCircle, Upload, Play } from 'lucide-react';

const VideoTest = () => {
    const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({ video: true, audio: true });
    const [uploading, setUploading] = useState(false);
    const [isMirrored, setIsMirrored] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const playbackVideoRef = React.useRef(null);
    const { API_URL, user } = useAuth();
    const navigate = useNavigate();

    const togglePlayback = () => {
        if (playbackVideoRef.current) {
            if (isPlaying) {
                playbackVideoRef.current.pause();
            } else {
                playbackVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Workaround to show preview while recording
    // react-media-recorder 1.6+ provides 'previewStream' which is a MediaStream
    // We can attach it to a video ref

    // Simplification: use the status to show "Recording..." and preview if possible.
    // Ideally we use a custom VideoPreview component.

    const [rounds, setRounds] = useState({ mcq: { enabled: true }, video: { enabled: true }, assignment: { enabled: true } });

    useEffect(() => {
        if (user && user.hiringRounds) {
            setRounds(user.hiringRounds);
        }
    }, [user]);

    const handleUpload = async () => {
        // ... (existing upload logic) ...
        // ... (inside success) ...
        // Check if Assignment round is enabled
        if (rounds.assignment?.enabled) {
            navigate('/exam/assignment');
        } else {
            navigate('/exam/status');
        }
        // ...
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Round 2: Video Teaching Test</span>
                        <Button variant="outline" size="sm" onClick={() => setIsMirrored(!isMirrored)}>
                            {isMirrored ? 'Disable Mirror' : 'Enable Mirror'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <p className="text-center text-gray-600 text-lg font-medium">
                        {rounds.video?.testId?.prompt || rounds.video?.testId?.instructions || rounds.video?.question || "Record a 2-5 minute video explaining a key concept in your domain."}
                    </p>

                    <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-lg bg-black">
                        {status !== 'stopped' ? (
                            <>
                                <VideoPreview stream={previewStream} isMirrored={isMirrored} />
                                {status === 'recording' && (
                                    <div className="absolute top-4 right-4 flex items-center space-x-2 rounded-full bg-red-600 px-3 py-1 text-white animate-pulse z-10">
                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                        <span className="text-xs font-bold">REC</span>
                                    </div>
                                )}
                            </>
                        ) : !mediaBlobUrl ? (
                            <div className="flex h-full w-full items-center justify-center text-white">
                                <p className="animate-pulse">Processing Video...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full h-full relative">
                                <video
                                    ref={playbackVideoRef}
                                    src={mediaBlobUrl}
                                    className={`w-full h-full rounded-lg bg-black object-cover ${isMirrored ? 'transform -scale-x-100' : ''}`}
                                    onEnded={() => setIsPlaying(false)}
                                />
                                {/* Overlay Controls */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
                                    <Button
                                        variant="secondary"
                                        onClick={togglePlayback}
                                        className="w-32 shadow-lg bg-white/90 hover:bg-white text-black"
                                    >
                                        {isPlaying ? (
                                            <> <StopCircle className="mr-2 h-4 w-4" /> Pause </>
                                        ) : (
                                            <> <Play className="mr-2 h-4 w-4" /> Play </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            if (playbackVideoRef.current) {
                                                playbackVideoRef.current.currentTime = 0;
                                                setIsPlaying(false);
                                                playbackVideoRef.current.pause();
                                            }
                                        }}
                                        className="shadow-lg bg-white/90 hover:bg-white text-gray-700"
                                    >
                                        Replay
                                    </Button>
                                </div>
                                <p className="absolute top-2 left-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
                                    * {isMirrored ? 'Mirrored View' : 'Standard View'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-4">
                        {status === 'idle' && (
                            <Button onClick={startRecording} variant="default" className="bg-indigo-600">
                                <Video className="mr-2 h-4 w-4" /> Start Recording
                            </Button>
                        )}
                        {status === 'recording' && (
                            <Button onClick={stopRecording} variant="destructive">
                                <StopCircle className="mr-2 h-4 w-4" /> Stop Recording
                            </Button>
                        )}
                        {status === 'stopped' && (
                            <Button onClick={startRecording} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                <Video className="mr-2 h-4 w-4" /> Retake Video
                            </Button>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleUpload} disabled={!mediaBlobUrl || uploading}>
                        {uploading ? 'Uploading...' : 'Submit Video'} <Upload className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

// Helper for preview
const VideoPreview = ({ stream, isMirrored }) => {
    const videoRef = React.useRef(null);

    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!stream) {
        return <div className="flex h-full w-full items-center justify-center text-white">Camera Off</div>;
    }

    return <video ref={videoRef} autoPlay muted controls={false} className={`h-full w-full object-cover ${isMirrored ? 'transform -scale-x-100' : ''}`} />;
};

export default VideoTest;
