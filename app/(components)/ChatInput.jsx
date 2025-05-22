import React, { useState, useRef } from "react";
import { Paperclip, Mic, MicOff, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AttachmentMenu from "./AttachmentMenu";
import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv();
const useCloudinaryAudioUpload = () => {
  const uploadAudioToCloudinary = async (audioBlob) => {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    


    if (!preset || !cloudName) {
      console.error("Missing Cloudinary environment variables");
      return null;
    }

    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("upload_preset", preset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error.response?.data || error);
      return null;
    }
  };

  return { uploadAudioToCloudinary };
};

const ChatInput = ({handleInputChange, handleSendMessageWithEnter, inputMessage, setInputMessage, onSendAudio, onUpload }) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const inputRef = useRef(null);
const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);
  const timerRef = useRef(null);
  const { uploadAudioToCloudinary } = useCloudinaryAudioUpload();

  const handleSendVoiceMessage = () => {
    if (uploadedAudioUrl) {
      onSendAudio(uploadedAudioUrl);
      setUploadedAudioUrl(null); // Clear preview after sending
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        // Upload audioBlob to Cloudinary
        const uploadedUrl = await uploadAudioToCloudinary(audioBlob);
        if (uploadedUrl) {
          setUploadedAudioUrl(uploadedUrl);
        } else {
          console.error("Failed to upload audio");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    console.log("Stopped recording, duration:", formatTime(recordingTime));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative w-full bg-white dark:bg-gray-900 shadow-lg ">
      <div className="flex items-end p-2 border border-gray-200 dark:border-gray-700 bg-background">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {attachmentMenuOpen && (
            <AttachmentMenu onClose={() => setAttachmentMenuOpen(false)} onUpload={onUpload} />
          )}
        </div>

        <div className="flex-1 mx-2">
{uploadedAudioUrl && (
  <div className="flex items-center gap-2 mt-2 p-2 border rounded bg-gray-100 dark:bg-gray-800">
    <audio controls src={uploadedAudioUrl} className="w-full" />
    <Button
      variant="primary"
      size="sm"
      className="ml-2"
      onClick={handleSendVoiceMessage}
    >
      <Send className="h-4 w-4 mr-1" /> Send
    </Button>
  </div>
)}
          <input
            onKeyDown={handleSendMessageWithEnter}
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className={cn(
              "w-full py-3 px-4 bg-transparent focus:outline-none text-base",
              isRecording && "opacity-50 pointer-events-none"
            )}
            value={inputMessage}
            onChange={handleInputChange}

            disabled={isRecording}
          />

          {isRecording && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="animate-pulse h-3 w-3 bg-red-500 rounded-full"></span>
              <span className="text-sm font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full transition-colors",
              isRecording
                ? "text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                : "text-muted-foreground hover:text-primary hover:bg-muted"
            )}
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {(uploadedAudioUrl !== null || inputMessage.trim()) && (
            <Button
              variant="primary"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground"

            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;