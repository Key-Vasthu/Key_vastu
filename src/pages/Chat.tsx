import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Image,
  FileText,
  PenTool,
  MoreVertical,
  Phone,
  Video,
  Search,
  Check,
  CheckCheck,
  Clock,
  X,
  MessageCircle,
  Mic,
  Square,
} from 'lucide-react';
import { Button, Avatar, Loading } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { chatApi, uploadApi } from '../utils/api';
import { cn, formatDate, formatFileSize } from '../utils/helpers';
import type { ChatThread, ChatMessage, UploadedFile } from '../types';
import {
  registerServiceWorker,
  subscribeToPushNotifications,
  showChatNotification,
  isPushNotificationSupported,
} from '../services/notifications';

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const previousMessageCountRef = useRef<number>(0);

  // Initialize browser notifications
  useEffect(() => {
    const initNotifications = async () => {
      if (isPushNotificationSupported()) {
        await registerServiceWorker();
        await subscribeToPushNotifications();
      }
    };
    initNotifications();
  }, []);

  // Show browser notification for new messages (when not in active thread)
  useEffect(() => {
    if (messages.length > 0 && activeThread) {
      const lastMessage = messages[messages.length - 1];
      // Only show notification if message is from someone else and app might be in background
      if (lastMessage.senderId !== user?.id && document.hidden) {
        const thread = threads.find(t => t.id === activeThread.id);
        if (thread) {
          showChatNotification(lastMessage, thread.participantName);
        }
      }
    }
  }, [messages, activeThread, threads, user]);

  // Check for shared drawing from DrawingBoard
  useEffect(() => {
    const sharedDrawing = localStorage.getItem('keyvasthu_share_drawing');
    if (sharedDrawing) {
      try {
        const drawing = JSON.parse(sharedDrawing);
        // Convert data URL to blob/file for upload
        fetch(drawing.imageData)
          .then(res => res.blob())
          .then(async (blob) => {
            const file = new File([blob], `${drawing.name || 'drawing'}.png`, { type: 'image/png' });
            const uploadFile: UploadedFile = {
              id: Date.now().toString(),
              name: file.name,
              type: file.type,
              size: file.size,
              status: 'uploading',
              progress: 0,
              uploadedAt: new Date().toISOString(),
            };
            setUploadedFiles(prev => [...prev, uploadFile]);

            // Upload the file
            const response = await uploadApi.uploadFile(file, (progress) => {
              setUploadedFiles(prev => prev.map(f => 
                f.id === uploadFile.id ? { ...f, progress } : f
              ));
            });

            if (response.success && response.data) {
              setUploadedFiles(prev => prev.map(f => 
                f.id === uploadFile.id ? { ...f, status: 'completed', url: response.data!.url } : f
              ));
              addNotification('success', 'Drawing Ready', 'Your drawing is ready to send in chat!');
            } else {
              setUploadedFiles(prev => prev.map(f => 
                f.id === uploadFile.id ? { ...f, status: 'error' } : f
              ));
              addNotification('error', 'Upload Failed', 'Failed to upload drawing.');
            }
          })
          .catch(err => {
            console.error('Error processing shared drawing:', err);
            addNotification('error', 'Drawing Error', 'Failed to process shared drawing.');
          });
        // Clear the shared drawing from localStorage
        localStorage.removeItem('keyvasthu_share_drawing');
      } catch (err) {
        console.error('Error parsing shared drawing:', err);
        localStorage.removeItem('keyvasthu_share_drawing');
      }
    }
  }, [addNotification]);

  // Real-time message polling - refresh messages every 2 seconds
  useEffect(() => {
    if (!activeThread) return;

    let isMounted = true;

    const pollMessages = async () => {
      if (!isMounted) return;
      
      const response = await chatApi.getMessages(activeThread.id);
      if (response.success && response.data && isMounted) {
        setMessages(prev => {
          // Only update if there are actual changes
          const prevCount = prev.length;
          const newCount = response.data!.length;
          
          if (newCount !== prevCount) {
            return response.data!;
          }
          
          // Check if any message changed (status, content, etc.)
          const hasChanges = response.data!.some((newMsg, idx) => {
            const oldMsg = prev[idx];
            if (!oldMsg) return true;
            return oldMsg.id !== newMsg.id || 
                   oldMsg.status !== newMsg.status ||
                   oldMsg.content !== newMsg.content ||
                   oldMsg.timestamp !== newMsg.timestamp;
          });
          
          return hasChanges ? response.data! : prev;
        });
      }
    };

    // Poll immediately, then every 2 seconds
    pollMessages();
    const interval = setInterval(pollMessages, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeThread?.id]);

  // Load threads and auto-create maintainer thread
  useEffect(() => {
    const loadThreads = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // First, get or create maintainer thread
        const maintainerResponse = await chatApi.getMaintainerThread();
        let maintainerThread: ChatThread | null = null;
        
        if (maintainerResponse.success && maintainerResponse.data) {
          maintainerThread = maintainerResponse.data;
        }

        // Then get all other threads
        const threadsResponse = await chatApi.getThreads();
        let allThreads: ChatThread[] = [];
        
        if (threadsResponse.success && threadsResponse.data) {
          allThreads = threadsResponse.data;
        }

        // Combine maintainer thread with other threads (maintainer thread first)
        const combinedThreads = maintainerThread 
          ? [maintainerThread, ...allThreads.filter(t => t.id !== maintainerThread!.id)]
          : allThreads;
        
        setThreads(combinedThreads);
        
        // Check if there's a thread param in URL
        const threadId = searchParams.get('thread');
        if (threadId) {
          const thread = combinedThreads.find(t => t.id === threadId);
          if (thread) {
            setActiveThread(thread);
          } else if (maintainerThread) {
            // If specified thread not found, default to maintainer thread
            setActiveThread(maintainerThread);
          }
        } else if (maintainerThread) {
          // Auto-select maintainer thread on first load
          setActiveThread(maintainerThread);
        } else if (combinedThreads.length > 0) {
          setActiveThread(combinedThreads[0]);
        }
      } catch (error) {
        console.error('Error loading threads:', error);
        addNotification('error', 'Connection Error', 'Failed to load conversations. Please try again.');
      }
      
      setIsLoading(false);
    };
    
    loadThreads();
  }, [searchParams, user, addNotification]);

  // Load messages when thread changes
  // Initial message load (only on thread change)
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeThread) return;
      
      const response = await chatApi.getMessages(activeThread.id);
      if (response.success && response.data) {
        setMessages(response.data);
        // Mark as initial load when messages are first loaded
        isInitialLoadRef.current = true;
        previousMessageCountRef.current = response.data.length;
      }
    };
    
    loadMessages();
  }, [activeThread?.id]);

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };

    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAttachMenu]);

  // Real-time typing indicator - show when other person sends a message recently
  useEffect(() => {
    if (activeThread && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Show typing indicator if last message is from other person and very recent
      if (lastMessage.senderId !== user?.id) {
        const messageTime = new Date(lastMessage.timestamp).getTime();
        const now = Date.now();
        // Show typing if message was received in last 3 seconds (simulating real-time)
        if (now - messageTime < 3000) {
          setIsTyping(true);
          const timeout = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
          return () => clearTimeout(timeout);
        } else {
          setIsTyping(false);
        }
      } else {
        setIsTyping(false);
      }
    }
  }, [messages, activeThread, user]);

  // Auto-scroll to show latest messages (like ChatGPT) - but not on initial load
  useEffect(() => {
    if (messages.length > 0) {
      // Skip auto-scroll on initial page load/refresh
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        previousMessageCountRef.current = messages.length;
        return;
      }
      
      // Only auto-scroll if new messages were added (count increased)
      if (messages.length > previousMessageCountRef.current) {
        // Small delay to ensure message is rendered before scrolling
        setTimeout(() => {
          // Scroll only within the messages container, not the outer page
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            // Scroll to bottom of the container only
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
      
      previousMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && uploadedFiles.length === 0 && !audioBlob) return;
    if (!activeThread) return;

    // If there's an audio blob, send it instead
    if (audioBlob && !newMessage.trim()) {
      await sendAudioMessage();
      return;
    }

    setIsSending(true);

    // Prepare attachments from uploaded files
    const attachments = uploadedFiles
      .filter(f => f.status === 'completed' && f.url)
      .map(f => ({
        id: f.id,
        name: f.name,
        type: f.type.startsWith('image/') ? 'drawing' as const : 'document' as const,
        url: f.url!,
        size: f.size,
        uploadedAt: f.uploadedAt,
      }));

    // Optimistic update - use actual user name from authentication
    // Note: timestamp is stored in UTC, but will be displayed in IST via formatDate
    const tempMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      senderId: user?.id || 'user-1',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar,
      content: newMessage || '',
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachments: attachments.length > 0 ? attachments : undefined,
      audioUrl: audioBlob && audioUrl ? audioUrl : undefined,
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setUploadedFiles([]);
    
    // Cleanup audio if sent
    if (audioBlob) {
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setRecordingTime(0);
    }

    // Send to API
    const response = await chatApi.sendMessage(
      activeThread.id,
      tempMessage.content,
      attachments.length > 0 ? attachments : undefined,
      audioBlob && audioUrl ? audioUrl : undefined
    );
    if (response.success && response.data) {
      // Update with real message (including attachments)
      const finalMessage = { ...response.data, attachments: tempMessage.attachments, status: 'sent' as const };
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? finalMessage : m));
      
      // Simulate status progression: sent -> delivered -> read (like WhatsApp)
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === finalMessage.id ? { ...m, status: 'delivered' as const } : m
        ));
      }, 500);
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === finalMessage.id ? { ...m, status: 'read' as const } : m
        ));
      }, 1500);
    } else {
      // If sending failed, remove the optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      addNotification('error', 'Failed to send', response.error || 'Could not send message. Please try again.');
    }

    setIsSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Upload all selected files and add them to preview (don't auto-send)
    for (const file of Array.from(files)) {
      const uploadFile: UploadedFile = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };
      
      setUploadedFiles(prev => [...prev, uploadFile]);

      // Upload file in background
      uploadApi.uploadFile(file, (progress) => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ));
      }).then((response) => {
        if (response.success && response.data) {
          // Update file status to completed
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, status: 'completed', url: response.data!.url } : f
          ));
        } else {
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, status: 'error' } : f
          ));
          addNotification('error', 'Upload Failed', `Failed to upload ${file.name}.`);
        }
      });
    }
    
    // Clear file input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAttachMenu(false);
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      addNotification('info', 'Recording Started', 'Voice recording in progress...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      addNotification('error', 'Microphone Access Denied', 'Please allow microphone access to use voice chat.');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      addNotification('success', 'Recording Stopped', 'Voice message recorded successfully.');
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      audioChunksRef.current = [];
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setRecordingTime(0);
    }
  };

  // Send audio message
  const sendAudioMessage = async () => {
    if (!audioBlob || !activeThread) return;

    setIsProcessingAudio(true);
    setIsSending(true);

    try {
      // Convert audio to text (simulated - in production, use speech-to-text API)
      // For now, we'll send it as an audio file attachment
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
        type: 'audio/webm',
      });

      // Upload audio file
      const uploadFile: UploadedFile = {
        id: Date.now().toString(),
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFiles([uploadFile]);

      const response = await uploadApi.uploadFile(audioFile, (progress) => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ));
      });

      if (response.success && response.data) {
        // Send message with audio attachment
        const messageText = `🎤 Voice message (${formatRecordingTime(recordingTime)})`;
        
        // Optimistic update - use actual user name from authentication
        const tempMessage: ChatMessage = {
          id: 'temp-' + Date.now(),
          senderId: user?.id || 'user-1',
          senderName: user?.name || 'You',
          senderAvatar: user?.avatar,
          content: messageText,
          timestamp: new Date().toISOString(),
          status: 'sent',
          audioUrl: response.data.url,
        };
        setMessages(prev => [...prev, tempMessage]);
        
        const sendResponse = await chatApi.sendMessage(
          activeThread.id,
          messageText,
          undefined,
          response.data.url
        );
        
        if (sendResponse.success && sendResponse.data) {
          // Update with real message
          setMessages(prev => prev.map(m => m.id === tempMessage.id ? sendResponse.data! : m));
        } else {
          // If sending failed, remove the optimistic message
          setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
          addNotification('error', 'Failed to send', sendResponse.error || 'Could not send voice message. Please try again.');
        }
        
        // Cleanup
        setAudioBlob(null);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
        setRecordingTime(0);
        setUploadedFiles([]);
      } else {
        addNotification('error', 'Upload Failed', 'Failed to upload voice message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending audio message:', error);
      addNotification('error', 'Error', 'Failed to send voice message. Please try again.');
    } finally {
      setIsProcessingAudio(false);
      setIsSending(false);
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent': 
        return <Check size={14} className="text-white/70" />;
      case 'delivered': 
        return <CheckCheck size={14} className="text-white/70" />;
      case 'read': 
        return <CheckCheck size={14} className="text-blue-300" />;
      default: 
        return <Clock size={14} className="text-white/50" />;
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading conversations..." />;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-cream-50">
      {/* Sidebar - Thread List */}
      <aside className={cn(
        'w-80 bg-white border-r border-earth-100 flex flex-col transition-all duration-300',
        showSidebar ? 'translate-x-0' : '-translate-x-full absolute lg:relative'
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-earth-100">
          <h2 className="text-xl font-display font-semibold text-astral-500 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-earth-50 border-0 rounded-xl focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={cn(
                'w-full p-4 flex items-center gap-3 hover:bg-earth-50 transition-colors text-left',
                activeThread?.id === thread.id && 'bg-saffron-50 border-r-2 border-saffron-500'
              )}
            >
              <Avatar
                src={thread.participantAvatar}
                name={thread.participantName}
                showOnlineStatus
                isOnline={thread.isOnline}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-earth-800 truncate">{thread.participantName}</h3>
                  <span className="text-xs text-earth-500">{thread.lastMessageTime}</span>
                </div>
                <p className="text-sm text-earth-500 truncate">{thread.lastMessage}</p>
              </div>
              {thread.unreadCount > 0 && (
                <span className="w-5 h-5 bg-saffron-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {thread.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {activeThread ? (
          <>
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-earth-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden p-2 hover:bg-earth-100 rounded-lg"
                >
                  <MoreVertical size={20} />
                </button>
                <Avatar
                  src={activeThread.participantAvatar}
                  name={activeThread.participantName}
                  showOnlineStatus
                  isOnline={activeThread.isOnline}
                  size="lg"
                />
                <div>
                  <h2 className="font-semibold text-earth-800">{activeThread.participantName}</h2>
                  <p className="text-sm text-earth-500">
                    {activeThread.isOnline ? (
                      <span className="text-green-600">Online</span>
                    ) : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/drawing-board">
                  <Button variant="ghost" size="sm">
                    <PenTool size={18} />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video size={18} />
                </Button>
              </div>
            </header>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-cream-50 to-white">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                    >
                      {!isOwn && (
                        <Avatar
                          src={message.senderAvatar}
                          name={message.senderName}
                          size="sm"
                        />
                      )}
                      <div className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-3',
                        isOwn
                          ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white rounded-br-sm'
                          : 'bg-white shadow-sm border border-earth-100 rounded-bl-sm'
                      )}>
                        {/* Attachments - Images */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id}>
                                {attachment.type === 'drawing' && attachment.url && (
                                  <div className={cn(
                                    "rounded-lg overflow-hidden border max-w-xs",
                                    isOwn ? "border-white/20" : "border-earth-200"
                                  )}>
                                    <img 
                                      src={attachment.url} 
                                      alt={attachment.name}
                                      className="max-w-full h-auto max-h-40 object-contain w-full"
                                      onError={(e) => {
                                        // Fallback if image fails to load
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                {attachment.type === 'document' && (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                                      isOwn
                                        ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                                        : 'bg-earth-50 border-earth-200 hover:bg-earth-100 text-earth-800'
                                    )}
                                  >
                                    <FileText size={20} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                                      {attachment.size && (
                                        <p className={cn('text-xs', isOwn ? 'text-white/70' : 'text-earth-500')}>
                                          {formatFileSize(attachment.size)}
                                        </p>
                                      )}
                                    </div>
                                    <Paperclip size={16} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Message Content */}
                        {message.content && (
                          <p className={isOwn ? 'text-white' : 'text-earth-800'}>
                            {message.content}
                          </p>
                        )}
                        
                        {/* Audio */}
                        {message.audioUrl && (
                          <div className="mt-2">
                            <audio controls className="w-full max-w-xs">
                              <source src={message.audioUrl} type="audio/webm" />
                              <source src={message.audioUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                        
                        {/* Timestamp and Status */}
                        <div className={cn(
                          'flex items-center gap-1.5 mt-1.5 text-xs',
                          isOwn ? 'text-white/70 justify-end' : 'text-earth-400'
                        )}>
                          <span>{formatDate(message.timestamp, 'time')}</span>
                          {isOwn && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Typing Indicator */}
                {isTyping && activeThread && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <Avatar
                      src={activeThread.participantAvatar}
                      name={activeThread.participantName}
                      size="sm"
                    />
                    <div className="bg-white shadow-sm border border-earth-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input Container - Fixed at bottom, not scrollable */}
            <div className="flex-shrink-0 bg-white border-t border-earth-100 relative">
              {/* Uploaded Files Preview - Above input area, properly contained */}
              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-[10]"
                  >
                    <div className="px-6 pt-5 pb-4 bg-earth-50/50 border-b border-earth-100">
                      <div className="flex flex-wrap gap-3 max-w-3xl mx-auto">
                        {uploadedFiles.map((file) => {
                          const isImage = file.type.startsWith('image/');
                          return (
                            <div
                              key={file.id}
                              className="relative flex-shrink-0 bg-white rounded-lg border border-earth-200 shadow-sm"
                              style={{ width: isImage ? '100px' : 'auto', minWidth: isImage ? '100px' : '180px', maxWidth: isImage ? '100px' : '250px' }}
                            >
                              <button
                                onClick={() => removeUploadedFile(file.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center z-20 hover:bg-red-600 transition-colors shadow-lg"
                                aria-label="Remove file"
                              >
                                <X size={14} />
                              </button>
                              {isImage && file.status === 'completed' && file.url ? (
                                <div className="relative overflow-hidden rounded-lg">
                                  <img 
                                    src={file.url} 
                                    alt={file.name}
                                    className="w-full h-20 object-cover"
                                    onError={(e) => {
                                      // Fallback handling if image fails
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] px-1.5 py-0.5 truncate">
                                    {file.name}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5 flex items-center gap-2 pr-8">
                                  <div className="w-8 h-8 bg-earth-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="text-gold-500" size={16} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-earth-800 truncate">{file.name}</p>
                                    <p className="text-[10px] text-earth-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                              )}
                              {file.status === 'uploading' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-earth-200">
                                  <div
                                    className="h-full bg-saffron-500 transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                  />
                                </div>
                              )}
                              {file.status === 'error' && (
                                <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center">
                                  <span className="text-[10px] text-red-600 font-medium px-1">Upload failed</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="px-6 py-4 relative z-20">
              <div className="flex items-end gap-3 max-w-3xl mx-auto">
                {/* Attachment button */}
                <div ref={attachMenuRef} className="relative z-30">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-3 text-earth-500 hover:text-saffron-600 hover:bg-saffron-50 rounded-xl transition-colors"
                  >
                    <Paperclip size={22} />
                  </button>
                  
                  <AnimatePresence>
                    {showAttachMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 bg-white rounded-xl shadow-2xl border border-earth-200 p-2 min-w-[160px] z-[100]"
                        style={{ 
                          marginBottom: uploadedFiles.length > 0 ? '12px' : '8px',
                          transformOrigin: 'bottom left'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowAttachMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-earth-700 hover:bg-earth-50 rounded-lg transition-colors"
                        >
                          <Image size={18} className="text-gold-500" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowAttachMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-earth-700 hover:bg-earth-50 rounded-lg transition-colors"
                        >
                          <FileText size={18} className="text-astral-500" />
                          Document
                        </button>
                        <Link
                          to="/drawing-board"
                          onClick={() => setShowAttachMenu(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-earth-700 hover:bg-earth-50 rounded-lg transition-colors"
                        >
                          <PenTool size={18} className="text-saffron-500" />
                          Drawing
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.dwg,.dxf"
                />

                {/* Message input */}
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      // Clear previous timeout
                      if (typingTimeout) {
                        clearTimeout(typingTimeout);
                      }
                      // Typing indicator stops after 2 seconds of inactivity
                      if (activeThread && e.target.value.length > 0) {
                        const timeout = setTimeout(() => {
                          // Typing stopped
                        }, 2000);
                        setTypingTimeout(timeout);
                      } else if (e.target.value.length === 0) {
                        if (typingTimeout) {
                          clearTimeout(typingTimeout);
                          setTypingTimeout(null);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                        // Clear typing indicator when message is sent
                        if (typingTimeout) {
                          clearTimeout(typingTimeout);
                          setTypingTimeout(null);
                        }
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 bg-earth-50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-gold-500 max-h-32"
                    style={{ minHeight: '48px' }}
                  />
                  {isTyping && (
                    <div className="absolute -top-6 left-4 text-xs text-earth-500 italic animate-pulse flex items-center gap-1">
                      <span className="flex gap-1">
                        <span className="w-1 h-1 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      <span>{activeThread?.participantName} is typing...</span>
                    </div>
                  )}
                </div>

                {/* Microphone button */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isProcessingAudio}
                    className="p-3 text-earth-500 hover:text-saffron-600 hover:bg-saffron-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Start voice recording"
                  >
                    <Mic size={22} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-red-600">
                        {formatRecordingTime(recordingTime)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="p-3 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                      title="Stop recording"
                    >
                      <Square size={18} fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-3 text-earth-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Cancel recording"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Send button */}
                {!isRecording && (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={(!newMessage.trim() && uploadedFiles.length === 0 && !audioBlob) || isProcessingAudio}
                    isLoading={isSending || isProcessingAudio}
                    className="rounded-xl !p-3"
                  >
                    {audioBlob && !newMessage.trim() ? (
                      <span className="flex items-center gap-2">
                        <Mic size={18} />
                        Send Voice
                      </span>
                    ) : (
                      <Send size={22} />
                    )}
                  </Button>
                )}
              </div>
            </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <div className="w-24 h-24 mx-auto mb-6 bg-earth-100 rounded-full flex items-center justify-center">
                <MessageCircle size={40} className="text-earth-400" />
              </div>
              <h3 className="text-xl font-display font-semibold text-earth-700 mb-2">
                Select a conversation
              </h3>
              <p className="text-earth-500">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;

