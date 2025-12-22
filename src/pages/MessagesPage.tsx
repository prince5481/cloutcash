import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Eye, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { z } from "zod";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_type: string;
}

interface Conversation {
  id: string;
  creator_id: string;
  brand_id: string;
  last_message_at: string;
  creator_profile?: Profile;
  brand_profile?: Profile;
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

// Mock data for testing
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "mock-1",
    creator_id: "creator-1",
    brand_id: "brand-1",
    last_message_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    creator_profile: {
      id: "creator-1",
      full_name: "Sarah Johnson",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      user_type: "creator",
    },
    brand_profile: {
      id: "brand-1",
      full_name: "TechBrand Co",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=TB",
      user_type: "brand",
    },
    last_message: {
      content: "Looking forward to collaborating on this campaign!",
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  },
  {
    id: "mock-2",
    creator_id: "creator-2",
    brand_id: "brand-2",
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    creator_profile: {
      id: "creator-2",
      full_name: "Alex Chen",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      user_type: "creator",
    },
    brand_profile: {
      id: "brand-2",
      full_name: "Fashion Forward",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=FF",
      user_type: "brand",
    },
    last_message: {
      content: "Can we schedule a call to discuss the details?",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  },
  {
    id: "mock-3",
    creator_id: "creator-3",
    brand_id: "brand-3",
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    creator_profile: {
      id: "creator-3",
      full_name: "Emma Rodriguez",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      user_type: "creator",
    },
    brand_profile: {
      id: "brand-3",
      full_name: "EcoLife Products",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=EL",
      user_type: "brand",
    },
    last_message: {
      content: "The content samples look great! When can we start?",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  },
  {
    id: "mock-4",
    creator_id: "creator-4",
    brand_id: "brand-4",
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    creator_profile: {
      id: "creator-4",
      full_name: "Marcus Williams",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      user_type: "creator",
    },
    brand_profile: {
      id: "brand-4",
      full_name: "FitGear Athletics",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=FG",
      user_type: "brand",
    },
    last_message: {
      content: "Thanks for sharing your rates. Let me review and get back to you.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  },
  {
    id: "mock-5",
    creator_id: "creator-5",
    brand_id: "brand-5",
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    creator_profile: {
      id: "creator-5",
      full_name: "Olivia Taylor",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
      user_type: "creator",
    },
    brand_profile: {
      id: "brand-5",
      full_name: "Beauty Bliss",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=BB",
      user_type: "brand",
    },
    last_message: {
      content: "Perfect! I'll send over the contract details soon.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-1",
    conversation_id: "mock-1",
    sender_id: "brand-1",
    content: "Hi! We're really interested in working with you on our new product launch.",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    read_at: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: "msg-2",
    conversation_id: "mock-1",
    sender_id: "creator-1",
    content: "That sounds exciting! I'd love to hear more about the campaign.",
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    read_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: "msg-3",
    conversation_id: "mock-1",
    sender_id: "brand-1",
    content: "Great! We're planning a 3-month campaign with weekly content. What are your rates for that?",
    created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    read_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "msg-4",
    conversation_id: "mock-1",
    sender_id: "creator-1",
    content: "Looking forward to collaborating on this campaign!",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read_at: null,
  },
];

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [useMockData, setUseMockData] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);

  // Unread count hook
  const { totalUnread, unreadByConversation, markConversationAsRead } = useUnreadCount(currentProfile?.id || null);

  // Typing indicator hook
  const { isOtherUserTyping, startTyping, stopTyping } = useTypingIndicator(
    activeConversation?.id || null,
    currentProfile?.id || null
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) setCurrentProfile(data);
    };
    fetchCurrentProfile();
  }, [user]);

  useEffect(() => {
    if (!currentProfile?.id) return;

    const fetchConversations = async () => {
      const { data: convData, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`creator_id.eq.${currentProfile.id},brand_id.eq.${currentProfile.id}`)
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      if (!convData || convData.length === 0) {
        return; // Keep mock data if no real data
      }

      // Switch to real data once available
      setUseMockData(false);

      // Get all unique profile IDs
      const profileIds = new Set<string>();
      convData.forEach((conv) => {
        profileIds.add(conv.creator_id);
        profileIds.add(conv.brand_id);
      });

      // Fetch all profiles at once
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", Array.from(profileIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      // Fetch last message for each conversation
      const conversationsWithMessages = await Promise.all(
        convData.map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            creator_profile: profileMap.get(conv.creator_id),
            brand_profile: profileMap.get(conv.brand_id),
            last_message: lastMsg || undefined,
          };
        })
      );

      setConversations(conversationsWithMessages);
    };

    fetchConversations();
    
    // Set up realtime subscription for new conversations
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `creator_id=eq.${currentProfile.id},brand_id=eq.${currentProfile.id}`
        },
        () => {
          console.log('New conversation detected, refetching...');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [currentProfile]);

  useEffect(() => {
    if (!activeConversation?.id) return;

    // Mark conversation as read when opened
    if (!useMockData && currentProfile?.id) {
      markConversationAsRead(activeConversation.id);
    }

    // If using mock data, filter mock messages for active conversation
    if (useMockData) {
      setMessages(MOCK_MESSAGES.filter(m => m.conversation_id === activeConversation.id));
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversation.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      if (data && data.length > 0) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages:${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, useMockData, currentProfile, markConversationAsRead]);

  const messageSchema = z.object({
    content: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(5000, "Message must be less than 5000 characters")
      .refine((msg) => msg.length > 0, "Message cannot contain only whitespace"),
  });

  const handleSendMessage = async () => {
    if (!activeConversation) return;

    // Validate message
    const validation = messageSchema.safeParse({ content: newMessage });
    if (!validation.success) {
      toast({
        title: "Invalid message",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const trimmedMessage = newMessage.trim();

    // Stop typing indicator
    stopTyping();

    // If using mock data, add message to mock state
    if (useMockData) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: activeConversation.id,
        sender_id: currentProfile?.id || "creator-1",
        content: trimmedMessage,
        created_at: new Date().toISOString(),
        read_at: null,
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      return;
    }

    if (!currentProfile) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversation.id,
      sender_id: currentProfile.id,
      content: trimmedMessage,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    // Update last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", activeConversation.id);

    setNewMessage("");
  };

  const getOtherProfile = (conv: Conversation): Profile | undefined => {
    // For mock data, assume we're the creator
    if (useMockData) {
      return conv.brand_profile;
    }
    if (!currentProfile) return undefined;
    return conv.creator_id === currentProfile.id
      ? conv.brand_profile
      : conv.creator_profile;
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherProfile = getOtherProfile(conv);
    return otherProfile?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Left Sidebar - Conversation List */}
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-2xl font-bold mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No conversations yet. Start swiping to match!
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const otherProfile = getOtherProfile(conv);
                  if (!otherProfile) return null;

                  const isActive = activeConversation?.id === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                        isActive ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <Avatar>
                          <AvatarImage src={otherProfile.avatar_url || ""} />
                          <AvatarFallback>
                            {otherProfile.full_name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">
                                {otherProfile.full_name}
                              </h3>
                              {!useMockData && unreadByConversation[conv.id] > 0 && (
                                <Badge variant="default" className="h-5 min-w-[1.25rem] px-1.5 text-xs">
                                  {unreadByConversation[conv.id]}
                                </Badge>
                              )}
                            </div>
                            {conv.last_message && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conv.last_message.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message?.content || "No messages yet"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${otherProfile.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Right Side - Chat Window */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={getOtherProfile(activeConversation)?.avatar_url || ""}
                      />
                      <AvatarFallback>
                        {getOtherProfile(activeConversation)?.full_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {getOtherProfile(activeConversation)?.full_name}
                      </h3>
                      {isOtherUserTyping ? (
                        <p className="text-sm text-primary animate-pulse">
                          Typing...
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {getOtherProfile(activeConversation)?.user_type}
                        </p>
                      )}
                    </div>
                  </div>

                  {currentProfile?.user_type === "brand" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateCampaignOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Campaign
                    </Button>
                  )}
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isMine = useMockData 
                        ? msg.sender_id.startsWith("creator")
                        : msg.sender_id === currentProfile?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (e.target.value.trim()) {
                          startTyping();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {currentProfile?.user_type === "brand" && activeConversation && (
        <CreateCampaignModal
          open={createCampaignOpen}
          onOpenChange={setCreateCampaignOpen}
          brandProfileId={currentProfile.id}
          creatorProfileId={
            currentProfile.id === activeConversation.brand_id
              ? activeConversation.creator_id
              : activeConversation.brand_id
          }
        />
      )}
    </div>
  );
};

export default MessagesPage;