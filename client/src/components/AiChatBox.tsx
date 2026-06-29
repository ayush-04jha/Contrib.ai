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
  type Sender = "user" | "bot";
  type Message = {
    sender: Sender;
    text: string;
    createdAt?: Date;
  };
  const [messages, setMessage] = useState<Message[]>([]); // yaha message set ho rha hai array me
  const [conversationId, setConversationId] = useState<string | null>(urlConversationId || null);
  const navigate  = useNavigate();
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

             <button onClick={navigateToLandingPage} className="rounded bg-lime-400 text-black h-6 font-medium cursor-pointer hover:bg-lime-300 transition mr-2 px-2 text-[15px]">
            Home 
          </button>
          </div>

          {/* where do i start */}
          <div className="flex gap-3 overflow-x-auto border border-[#1E2530] p-2 text-[11px] text-white">
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC]">Where do I start?</div>
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC]">Explain the architecture</div>
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC]">Find a good first issue</div>
            <div className="whitespace-nowrap rounded-[5px] border-2 border-[#1E2530] bg-[#11141C] px-2 text-[#828FAC]">How do I run this locally?</div>
          </div>

          {/* chat app */}
          <div className="flex min-h-[60vh] flex-1 flex-col gap-2 overflow-y-auto p-3.5 py-auto">
            {messages.map((msg: Message, i: number) => (
              <div
                key={i}
                className={`max-w-xs rounded-lg px-4 py-2 text-[14px] text-white ${msg.sender === "user" ? "ml-auto border border-[#1e2530] bg-[#11141c]" : "border-2 border-[#2a3048] bg-[#1a2035]"
                  }`}
              >
                {msg.text}
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
              className="h-[65%] min-w-[95%] rounded-2xl border-2 border-[#1E2530] pl-3 text-white"
            />

            <button onClick={sendQuerry} className="cursor-pointer">
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
