// app/chat/page.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble";
import { socket } from "@/utils/socket";
import SideBar from "../(components)/SideBar";
import Header from "../(components)/Header";
import { Store } from "../(components)/Store";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ChatInput from "../(components)/Chatinput";
import { MessageLoading } from "@/components/ui/message-loading";
export default function Page() {
  const [inputMessage, setInputMessage] = useState(""); // For input field
  const [messages, setMessages] = useState([]); // For chat messages
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const {SelectedUser}=Store()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Preview URLs for uploaded files
  const [imageUrl, setImageUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

 
  // Handle input change
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    socket.emit("typing", {
      sender: session?.user?.name,
      receiver: SelectedUser?.name,
    });
  };


  // Handle sending message with Enter key
  const handleSendMessageWithEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputMessage.length > 0) {
        socket.emit("chat message", {
          sender: session?.user?.name,
          receiver: SelectedUser?.name,
          content: inputMessage
        });
        setInputMessage(""); // Clear input after sending
      }
      if (inputMessage.length === 0) {
        alert("Please enter a message");
      }
    }
  };



  useEffect(() => {
    // Fetch chat history
    axios
      .get("/api/getMessages", {
        params: {
          user1: session?.user.name,
          user2: SelectedUser?.name,
        },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));

    // Listen for new messages
    socket.on("chat message", (msg) => {
      if (
        (msg.sender === session?.user.name && msg.receiver === SelectedUser?.name) ||
        (msg.sender === SelectedUser?.name && msg.receiver === session?.user.name)
      ) {
        setMessages((prev) => [...prev, { ...msg, timestamp: Date.now() }]);
      }
    });

    return () => socket.off("chat message");
  }, [session?.user.name, SelectedUser]);

  useEffect(() => {
    socket.on("typing", ({ sender, receiver }) => {
      if (
        sender === SelectedUser?.name &&
        receiver === session?.user?.name
      ) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500); // reset after 2 sec
      }
    });

    return () => {
      socket.off("typing");
    };
  }, [SelectedUser, session?.user?.name]);



  // WebSocket setup
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to server");
    });



    socket.on("message", (message) => {
      console.log("New message:", message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array since socket is a stable reference



useEffect(() => {
  if (containerRef.current) {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }
}, [messages]);


  const onUpload = (fileData) => {
    if (fileData.image) setImageUrl(fileData.image);
    if (fileData.audio) setAudioUrl(fileData.audio);
    if (fileData.file) setFileUrl(fileData.file);
    if (fileData.video) setVideoUrl(fileData.video);
    // Do not send the uploaded file as a message automatically.
  };

  return (
    <div className="h-screen w-full bg-black flex">
      <SideBar />
      <div className="h-full w-full flex flex-col justify-between">
        <Header  />
        {/* Voice chat UI */}
        {isVoiceChatActive && (
          <div className="voice-chat-ui fixed top-5 left-5 w-full bg-black/70 p-4 rounded-lg z-50">
            <div className="video-container flex justify-between mb-2">
              <video autoPlay muted className="w-[45%] h-auto bg-gray-800 rounded" />
              <video autoPlay className="w-[45%] h-auto bg-gray-800 rounded" />
            </div>
            <Button onClick={disconnectCall} className="bg-red-600 hover:bg-red-700 text-white">
              Disconnect
            </Button>
          </div>
        )}
        <div
          className="p-7 flex flex-col justify-start h-full w-full overflow-y-auto"
          ref={containerRef}
        >
          {/* Dynamic messages from WebSocket */}
          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              variant={msg.sender === session?.user.name ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                fallback={msg.sender === session?.user.name ? "ME" : msg.sender?.charAt(0).toUpperCase()}
                src={
                  msg.sender === session?.user.name
                    ? session?.user?.image
                    : SelectedUser?.image
                }
              />
              <ChatBubbleMessage variant={msg.sender === session?.user.name ? "sent" : "received"}>
                <div className="text-xs text-gray-400 mb-1">
                  {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
               {typeof msg.content === "string" ? (
  msg.content.match(/\.(mp3|wav)$/i) ? (
    <audio controls src={msg.content} className="max-w-xs" />
  ) : msg.content.match(/\.(jpg|jpeg|png|webp)$/i) ? (
    <img src={msg.content} alt="uploaded" className="max-w-xs rounded" />
  ) : msg.content.match(/\.(mp4|webm|ogg)$/i) ? (
    <video controls src={msg.content} className="max-w-xs rounded" />
  ) : msg.content.match(/\.(pdf|docx?|xlsx?|pptx?)$/i) ? (
    <a href={msg.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
      View Document
    </a>
  ) : msg.content.startsWith("http") ? (
    <a href={msg.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
      View File
    </a>
  ) : (
    <h1>{msg.content}</h1>
  )
) : null}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-white mb-2 px-4">
              <span>{session?.user?.name} is typing</span>
              <MessageLoading />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input  w-full">
         
          {(imageUrl || videoUrl || audioUrl || fileUrl) && (
            <div className="w-full h-20 bg-zinc-600 px-5 flex gap-x-4 justify-center items-center">
              {imageUrl && (
                <div className="flex items-center gap-2">
                  <img src={imageUrl} alt="Uploaded" className="h-14 rounded object-cover" />
                </div>
              )}
              {videoUrl && (
                <div className="flex items-center gap-2">
                  <video controls src={videoUrl} className="h-14 rounded object-cover" />
                </div>
              )}
              {audioUrl && (
                <div className="flex items-center gap-2">
                  <audio controls src={audioUrl} className="h-10" />
                </div>
              )}
              {fileUrl && (
                <div className="flex items-center gap-2">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-white underline">
                    View File
                  </a>
                </div>
              )}
            </div>
          )}
          {/* Send button for file/audio/image preview */}
          {(imageUrl || videoUrl || audioUrl || fileUrl) && (
            <div className="flex justify-end p-2">
              <Button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  let contentToSend = imageUrl || videoUrl || audioUrl || fileUrl;
                  if (!contentToSend) return;

                  const message = {
                    sender: session?.user?.name,
                    receiver: SelectedUser?.name,
                    content: contentToSend,
                  };

                  socket.emit("chat message", message);
                  setMessages((prev) => [...prev, { ...message, timestamp: Date.now() }]);

                  // Clear previews
                  setImageUrl(null);
                  setVideoUrl(null);
                  setAudioUrl(null);
                  setFileUrl(null);
                }}
              >
                Send
              </Button>
            </div>
          )}
         
          <ChatInput
          onUpload={onUpload}
          handleInputChange={handleInputChange}
            handleSendMessageWithEnter={handleSendMessageWithEnter}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendAudio={(audioUrl) => {
              const audioMessage = {
                sender: session?.user?.name,
                receiver: SelectedUser?.name,
                content: audioUrl, // HTML content to display audio
              };
              socket.emit("chat message", audioMessage);
              setMessages((prev) => [
                ...prev,
                {
                  sender: session?.user?.name,
                  receiver: SelectedUser?.name,
                  content: audioUrl,
                  timestamp: Date.now(),
                }
              ]);
            }}
          />
        </div>
      </div>
    </div>
  );
}
//         <div className="w-full h-28 bg-zinc-600 px-5 flex gap-x-4 justify-center items-center">
//           <DropdownMenu>
//       <DropdownMenuTrigger asChild className="text-white cursor-pointer">
//       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
//   <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
// </svg>

//       </DropdownMenuTrigger>
//       <DropdownMenuContent>
//        <div className="flex gap-x-2 items-center px-2 cursor-pointer">
// <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
//   <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
// </svg>
// <h1>Files</h1>
//        </div>
// <div className="bg-black/30 w-full h-[1px] my-3 mx-2"></div>
//            <div className="flex gap-x-2 items-center px-2 py-1 cursor-pointer">
 
// <h1>Files</h1>
//        </div>
//       </DropdownMenuContent>
//     </DropdownMenu>
//       <div>
//     <Popover onOpenChange={setIsOpen} open={isOpen}>
//         <PopoverTrigger asChild>
//           <div className="text-yellow-500  cursor-pointer">

//          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
//   <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
// </svg>
//           </div>

//         </PopoverTrigger>
//         <PopoverContent className="w-fit p-0">
//           <EmojiPicker
//             className="h-[342px]"
//             onEmojiSelect={({ emoji }) => {
//               setIsOpen(false);
// setInputMessage((prev) => prev + emoji);
//             }}
//           >
//             <EmojiPickerSearch />
//             <EmojiPickerContent />
//             <EmojiPickerFooter />
//           </EmojiPicker>
//         </PopoverContent>
//       </Popover>

//       </div>
//           <input
//             type="text"
//             className="border-2 p-2 h-14 w-[90%] border-blue-500 bg-white/50 rounded-lg text-black px-2 py-1 shadow outline-none"
//             placeholder="Type your message..."
//             value={inputMessage}
//             onChange={handleInputChange}
//             onKeyDown={handleSendMessageWithEnter}
//           />
// <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M1.94607 9.31543C1.42353 9.14125 1.4194 8.86022 1.95682 8.68108L21.043 2.31901C21.5715 2.14285 21.8746 2.43866 21.7265 2.95694L16.2733 22.0432C16.1223 22.5716 15.8177 22.59 15.5944 22.0876L11.9999 14L17.9999 6.00005L9.99992 12L1.94607 9.31543Z"></path></svg>
//         </div>