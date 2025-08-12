import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";

const socket = io("https://mediately.onrender.com/"); 

export default function MessagingChat() {
  const { caseId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [userNames, setUserNames] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser?.uid) {
      fetchUserNameById(currentUser.uid).then(name => setCurrentUserName(name));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(
        collection(db, "chats", caseId, "messages"),
        orderBy("timestamp", "asc")
      );
      const querySnapshot = await getDocs(q);
      const msgs = [];
      for (let docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const senderName = await fetchUserNameById(data.senderId);
        msgs.push({
          ...data,
          senderName,
        });
      }
      setMessages(msgs);
    };
    fetchMessages();
  }, [caseId]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserNameById = async (uid) => {
    if (userNames[uid]) return userNames[uid];
    try {
      const docRef = doc(db, "accounts", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const name = docSnap.data().name || "Anonymous";
        setUserNames((prev) => ({ ...prev, [uid]: name }));
        return name;
      }
    } catch (err) {
      console.error("Error fetching user name for", uid, err);
    }
    return "Anonymous";
  };

  // Join socket room and listen for messages
  useEffect(() => {
    socket.emit("joinRoom", { roomId: caseId });
    fetchMessages();
    
    socket.on("receiveMessage", async (message) => {
      if (!message.senderName) {
        message.senderName = await fetchUserNameById(message.senderId);
      }
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [caseId]);

  const fetchMessages = async () => {
    const q = query(
      collection(db, "chats", caseId, "messages"),
      orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(q);
    const msgs = [];
    for (let docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const senderName = await fetchUserNameById(data.senderId);
      msgs.push({ ...data, senderName });
    }
    setMessages(msgs);
    scrollToBottom();
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (!currentUserName) {
      console.warn("User name not loaded yet.");
      return;
    }

    const messageData = {
      caseId,
      senderId: currentUser?.uid,
      senderName: currentUserName,
      text: newMessage,
      timestamp: Date.now(),
    };

    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <div className="bg-black text-white px-6 py-4 shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Case Discussion</h1>
            <p className="text-gray-300 text-sm">{caseId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-300">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = msg.senderId === currentUser?.uid;
              const showSender = index === 0 || messages[index - 1].senderId !== msg.senderId;
              
              return (
                <div key={index} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-2" : "order-1"}`}>
                    {showSender && !isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {(msg.senderName || "U")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {msg.senderName || "Unknown"}
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        isOwn
                          ? "bg-black text-white rounded-br-md"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                    
                    <div className={`mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                      <span className="text-xs text-gray-400">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none text-sm"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-all duration-200 ${
              newMessage.trim()
                ? "bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg transform hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {currentUserName && (
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>Chatting as {currentUserName}</span>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        )}
      </div>
    </div>
  );
}