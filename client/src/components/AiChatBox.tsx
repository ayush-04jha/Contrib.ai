import { useCallback, useEffect, useState } from "react";
import LogoIcon from "./LogoIcon";
import SendIcon from "./SendIcon";
import IssuePanel from "./IssuePanel";
import RepoConversationSidebar from "./RepoConversationSidebar";
import { socket } from "../socket";
import API from "../../axiosSetup/API";
import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";

function AiChatBox() {
  const { jobId, conversationId: urlConversationId } = useParams();
  const repoId = jobId ?? localStorage.getItem("repoId");
  const conversationStorageKey = repoId ? `conversationId:${repoId}` : "conversationId";
  const [querry, updatequerry] = useState("");
  const [user, setUser] = useState<any>(null);
  type Sender = "user" | "bot";
  type Message = {
    sender: Sender;
    text: string;
    createdAt?: Date;
  };
  const [messages, setMessage] = useState<Message[]>([]); // yaha message set ho rha hai array me
  const [conversationId, setConversationId] = useState<string | null>(urlConversationId || null);
  const navigate  = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Simple markdown formatter
  const formatMessage = (text: string) => {
    if (!text) return '';

    // Escape HTML first
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```code```
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-[#0a0c10] border border-[#1e2530] rounded-lg p-3 my-2 overflow-x-auto text-[#a8ff3e] font-mono text-xs">$1</pre>');

    // Inline code `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-[#1a2035] text-[#a8ff3e] px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

    // Bold **text**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');

    // Italic *text*
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="text-gray-300">$1</em>');

    // Headers ### Heading
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-3 mb-1">$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-3 mb-1">$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-3 mb-1">$1</h1>');

    // Lists - item
    formatted = formatted.replace(/^- (.+)$/gm, '<li class="text-gray-300 ml-4 my-1">• $1</li>');

    // Numbered lists 1. item
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li class="text-gray-300 ml-4 my-1">$1</li>');

    // Links [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#a8ff3e] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  };
  // Ensure repoId is always available from URL params when present
  useEffect(() => {
    if (jobId) {
      localStorage.setItem("repoId", jobId);
    }
  }, [jobId]);

  // whenever AiChatBox render on UI this socket connect useeffect will run and try to connect a web-socket to the server
  // functions
  const fetchMessage = useCallback(async () => {
    console.log("frontend convId:", conversationId);
    try {
      const response = await API.get("/messages", {
        params: {
          conversationId,
        },
      });
      setMessage(response.data);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        localStorage.removeItem(conversationStorageKey);
        setMessage([]);
        const res = await API.post("/conversation", { repoId });
        const newConversationId = res.data._id;
        setConversationId(newConversationId);
        localStorage.setItem(conversationStorageKey, newConversationId);
        return;
      }

      console.error(err);
    }
  }, [conversationId, conversationStorageKey, repoId]);

  const sendQuerry = () => {
    const message: Message = { sender: "user", text: querry };
    if (!message.text.trim()) return;
    console.log("Sending query with conversationId:", conversationId, "repoId:", repoId);
    setMessage((prev) => [...prev, message]);
    socket.emit("querry_sent", { conversationId, repoId, querry: message.text });
    updatequerry("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevents newline
      sendQuerry(); // your send function
    }
  };

  const navigateToLandingPage = ()=>{
          navigate("/")
  }

  //useEffects 1
  useEffect(() => {
    const initConversation = async () => {
      console.log("Initializing conversation with jobId:", jobId, "repoId:", repoId, "urlConversationId:", urlConversationId);

      // If conversationId is provided in URL, use it directly
      if (urlConversationId) {
        try {
          console.log("Loading specific conversation from URL:", urlConversationId);
          const response = await API.get(`/messages`, {
            params: { conversationId: urlConversationId }
          });
          setConversationId(urlConversationId);
          localStorage.setItem(conversationStorageKey, urlConversationId);
          setMessage(response.data);
          return;
        } catch (err) {
          console.error("Error loading conversation from URL:", err);
          // If error, fall through to create new conversation
        }
      }

      // Try to fetch existing conversation by repoId when jobId is present
      if (jobId) {
        try {
          console.log("Fetching existing conversation for repoId:", jobId);
          const response = await API.get(`/conversation/repo/${jobId}`);
          const existingConversation = response.data;
          console.log("Found existing conversation:", existingConversation._id, "with messages:", existingConversation.messages?.length);
          setConversationId(existingConversation._id);
          localStorage.setItem(conversationStorageKey, existingConversation._id);
          // Load existing messages
          setMessage(existingConversation.messages || []);
          return;
        } catch (err) {
          console.log("No existing conversation found, creating new one");
          // If no conversation exists, create a new one
          const res = await API.post("/conversation", { repoId: jobId });
          const newConversationId = res.data._id;
          console.log("Created new conversation:", newConversationId);
          setConversationId(newConversationId);
          localStorage.setItem(conversationStorageKey, newConversationId);
          return;
        }
      }

      // For non-jobId cases, try to reuse existing conversation
      const existingId = localStorage.getItem(conversationStorageKey);
      if (existingId) {
        console.log("Reusing existing conversation from localStorage:", existingId);
        setConversationId(existingId);
        return;
      }

      console.log("Creating new conversation for non-jobId case");
      const res = await API.post("/conversation", { repoId });
      const newConversationId = res.data._id;
      setConversationId(newConversationId);
      localStorage.setItem(conversationStorageKey, newConversationId);
    };

    initConversation();
  }, [conversationStorageKey, jobId, repoId, urlConversationId]);

  //useEffects 2
  useEffect(() => {
    if (!conversationId) return;
    // Only fetch messages if we don't have jobId or urlConversationId (since we load them from conversation for jobId case)
    if (!jobId && !urlConversationId) {
      fetchMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, jobId, urlConversationId]);

  //useEffects 3
  useEffect(() => {
    socket.connect();
    if (socket.connected) {
      console.log("Already connected:", socket.id);
    }
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  //useEffects 4
  useEffect(() => {
    const handler = (data: { ai_response: string }) => {
      setMessage((prev) => [
        ...prev,
        { sender: "bot", text: data.ai_response }
      ]);
    };

    socket.on("answer_received", handler);

    return () => {
      socket.off("answer_received", handler);
    };
  }, []);

  return (
    <div className="min-h-screen border border-[#1E2530] bg-[#0d0f14]">
      <style>{`
        .formatted-message pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .formatted-message code {
          white-space: pre-wrap;
        }
        .formatted-message h1,
        .formatted-message h2,
        .formatted-message h3 {
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .formatted-message p {
          margin-bottom: 0.5rem;
        }
        .formatted-message ul,
        .formatted-message ol {
          margin-left: 1rem;
          margin-bottom: 0.5rem;
        }
        .formatted-message li {
          margin-bottom: 0.25rem;
        }
      `}</style>
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[auto_minmax(0,1fr)_360px]">
        <RepoConversationSidebar />
        <section className="flex min-h-screen flex-col border-r border-[#1E2530]">
          {/* contrib.ai assistant */}
          <div className="border border-[#1E2530] flex  items-center justify-between">
            <div className="flex gap-3.5  pl-4">
              <LogoIcon />
              <div className="text-white">
                <div className="font-syne-Bold text-[13px]">contrib.ai assistant</div>
                <div className="text-[12px] text-[#6b7788]">context-aware - facebook/react</div>
              </div>
            </div>

            {/* Home button - only show if user is logged in */}
            {user && (
              <button onClick={navigateToLandingPage} className="rounded bg-lime-400 text-black h-6 font-medium cursor-pointer hover:bg-lime-300 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,255,62,0.3)] hover:scale-105 mr-2 px-2 text-[15px]">
                Home
              </button>
            )}
          </div>

          {/* where do i start */}
          <div className="flex gap-3 overflow-x-auto border border-[#1E2530] p-2 text-[11px] text-white">
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC] transition-all duration-300 hover:border-[#a8ff3e] hover:text-[#a8ff3e] cursor-pointer">Where do I start?</div>
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC] transition-all duration-300 hover:border-[#a8ff3e] hover:text-[#a8ff3e] cursor-pointer">Explain the architecture</div>
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC] transition-all duration-300 hover:border-[#a8ff3e] hover:text-[#a8ff3e] cursor-pointer">Find a good first issue</div>
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC] transition-all duration-300 hover:border-[#a8ff3e] hover:text-[#a8ff3e] cursor-pointer">How do I run this locally?</div>
          </div>

          {/* chat app */}
          <div className="flex min-h-[60vh] flex-1 flex-col gap-2 overflow-y-auto p-3.5 py-auto">
            {messages.map((msg: Message, i: number) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-lg px-4 py-3 text-[14px] transition-all duration-300 hover:scale-102 hover:shadow-[0_0_10px_rgba(168,255,62,0.2)] ${msg.sender === "user" ? "ml-auto border border-[#1e2530] bg-[#11141c]" : "border-2 border-[#2a3048] bg-[#1a2035]"
                  }`}
              >
                <div className="text-gray-300 leading-relaxed formatted-message" dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
              </div>
            ))}
          </div>

          {/* input box */}
          <div className="flex h-[10vh] items-center justify-around border-2 border-[#1E2530] px-4 pr-4">
            <input
              type="text"
              onKeyDown={handleKeyDown}
              value={querry}
              onChange={(e) => { updatequerry(e.target.value) }}
              placeholder="Ask anything about this repo..."
              className="h-[65%] min-w-[95%] rounded-2xl border-2 border-[#1E2530] pl-3 text-white transition-all duration-300 focus:border-[#a8ff3e] focus:shadow-[0_0_10px_rgba(168,255,62,0.3)]"
            />

            <button onClick={sendQuerry} className="cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,255,62,0.3)] hover:scale-110">
              <SendIcon />
            </button>
          </div>
        </section>

        <IssuePanel jobid={jobId} />
      </div>
    </div>
  );
}

export default AiChatBox;
