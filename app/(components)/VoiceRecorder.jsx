import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Mic, Square, Send } from "lucide-react";

const VoiceRecorder = ({ onStop }) => {
  const [isRecording, setIsRecording] = useState(true);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    startRecording();

    timerRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsRecording(false);
      });

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const sendAudio = () => {
    if (audioUrl) {
      onStop(audioUrl);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg flex-1">
      <div className="flex items-center space-x-2 flex-grow">
        <Mic className={`h-5 w-5 ${isRecording ? "text-red-500 animate-pulse" : "text-gray-500"}`} />
        <div className="flex-grow">
          {isRecording ? (
            <div className="flex items-center">
              <div className="mr-2 text-red-500 font-medium">Recording</div>
              <div className="text-xs text-gray-500">{formatTime(duration)}</div>
              <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 animate-pulse"
                  style={{ width: `${Math.min((duration / 60) * 100, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="mr-2 text-gray-700">Audio recorded</div>
              <div className="text-xs text-gray-500">{formatTime(duration)}</div>
            </div>
          )}
        </div>
      </div>

      {isRecording ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200"
          onClick={stopRecording}
        >
          <Square className="h-4 w-4 text-red-500" />
        </Button>
      ) : (
        <Button
          size="sm"
          className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
          onClick={sendAudio}
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      )}
    </div>
  );
};

VoiceRecorder.propTypes = {
  onStop: PropTypes.func.isRequired,
};

export default VoiceRecorder;