import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = "en-US-falcon" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const MURF_API_KEY = process.env.MURF_API_KEY;

    // If no Murf API key, return a special "no-audio" response so client can use browser TTS fallback
    if (!MURF_API_KEY || MURF_API_KEY === "your_murf_api_key_here") {
      console.warn("MURF_API_KEY not configured — returning no-audio signal for browser TTS fallback");
      return NextResponse.json({ noAudio: true, text }, { status: 200 });
    }

    // Call Murf.ai Falcon streaming TTS API
    const murfResponse = await fetch("https://api.murf.ai/v1/speech/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": MURF_API_KEY,
      },
      body: JSON.stringify({
        voiceId: voiceId,
        text: text,
        format: "MP3",
        sampleRate: 24000,
        channelType: "MONO",
        encodeAsBase64: false,
        variation: 1,
        audioDuration: 0,
        style: "Conversational",
        modelVersion: "falcon-1.0",
      }),
    });

    if (!murfResponse.ok) {
      const errorText = await murfResponse.text();
      console.error("Murf API error:", murfResponse.status, errorText);
      // Return no-audio signal so client can fall back to browser TTS
      return NextResponse.json({ noAudio: true, text }, { status: 200 });
    }

    // Stream the audio response back to the client
    const audioBuffer = await murfResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS route error:", error);
    // Return no-audio signal instead of crashing
    return NextResponse.json({ noAudio: true }, { status: 200 });
  }
}
