import React from "react";
import { Image, FileImage, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

const AttachmentMenu = ({ onClose, onUpload }) => {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [audioUrl, setAudioUrl] = React.useState(null);
  const [fileUrl, setFileUrl] = React.useState(null);
  const [videoUrl, setVideoUrl] = React.useState(null);

  
 const handleAttachImageOrVideo = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5MB.");
      return;
    }
    if (file && file.type.startsWith("video/") && file.size > 20 * 1024 * 1024) {
      alert("Video size should not exceed 20MB.");
      return;
    }
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);
      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          formData
        );
        if (file.type.startsWith("image/")) {
          setImageUrl(response.data.secure_url);
          if (onUpload) onUpload({ image: response.data.secure_url });
        } else {
          setVideoUrl(response.data.secure_url);
          if (onUpload) onUpload({ video: response.data.secure_url });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    onClose();
  };

  input.click();
};

 const handleAttachFile = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.csv,.json,.xml,.rtf,.odt,.ods,.odp";
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 20 * 1024 * 1024) {
      alert("File size should not exceed 20MB.");
      return;
    }
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset); // from Cloudinary settings

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
          formData
        );
setFileUrl(response.data.secure_url);
        if (onUpload) onUpload({ file: response.data.secure_url });
        // You can now send response.data.secure_url in your message
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    onClose();
  };

  input.click();
};

 const handleAttachAudio = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 20 * 1024 * 1024) {
      alert("File size should not exceed 20MB.");
      return;
    }
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset); // from Cloudinary settings

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
          formData
        );
setAudioUrl(response.data.secure_url);
        if (onUpload) onUpload({ audio: response.data.secure_url });
        // You can now send response.data.secure_url in your message
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    onClose();
  };

  input.click();
};

  return (
    <div className="absolute bottom-14 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-10">
      <div className="flex flex-col w-48">
        <button
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleAttachImageOrVideo}
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Image className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </div>
          <span className="text-sm">Gallery</span>
        </button>
        
        <button
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleAttachFile}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FileImage className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </div>
          <span className="text-sm">Document</span>
        </button>
        
        <button
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleAttachAudio}
        >
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <FileAudio className="h-4 w-4 text-green-500 dark:text-green-400" />
          </div>
          <span className="text-sm">Audio</span>
        </button>
      </div>
    </div>
  );
};

export default AttachmentMenu;