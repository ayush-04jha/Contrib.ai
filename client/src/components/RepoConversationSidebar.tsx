import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare, Clock, FolderOpen } from "lucide-react";

// Dummy data for repos and their conversations
const dummyRepos = [
  {
    id: "1",
    name: "facebook/react",
    conversationCount: 3,
    conversations: [
      {
        id: "conv-1",
        title: "Understanding React Architecture",
        lastMessage: "The architecture consists of reconciler, renderer, and scheduler...",
        timestamp: "2 hours ago",
        messageCount: 12
      },
      {
        id: "conv-2",
        title: "Component Lifecycle Questions",
        lastMessage: "useEffect replaces componentDidMount, componentDidUpdate, and componentWillUnmount...",
        timestamp: "2 days ago",
        messageCount: 20
      },
      {
        id: "conv-3",
        title: "Hooks Best Practices",
        lastMessage: "Always include all dependencies in the useEffect dependency array...",
        timestamp: "1 week ago",
        messageCount: 8
      }
    ]
  },
  {
    id: "2",
    name: "vercel/next.js",
    conversationCount: 2,
    conversations: [
      {
        id: "conv-4",
        title: "Setup and Installation Guide",
        lastMessage: "You can install Next.js using npm create next-app or yarn...",
        timestamp: "5 hours ago",
        messageCount: 8
      },
      {
        id: "conv-5",
        title: "SSR vs SSG Configuration",
        lastMessage: "For SSR use getServerSideProps, for SSG use getStaticProps...",
        timestamp: "3 days ago",
        messageCount: 15
      }
    ]
  },
  {
    id: "3",
    name: "tailwindlabs/tailwindcss",
    conversationCount: 1,
    conversations: [
      {
        id: "conv-6",
        title: "Good First Issues for Beginners",
        lastMessage: "Here are some good first issues: #1234, #5678, #9012...",
        timestamp: "1 day ago",
        messageCount: 15
      }
    ]
  },
  {
    id: "4",
    name: "jestjs/jest",
    conversationCount: 1,
    conversations: [
      {
        id: "conv-7",
        title: "Testing Strategy Discussion",
        lastMessage: "Jest uses a snapshot testing approach for component testing...",
        timestamp: "3 days ago",
        messageCount: 7
      }
    ]
  },
  {
    id: "5",
    name: "axios/axios",
    conversationCount: 1,
    conversations: [
      {
        id: "conv-8",
        title: "API Integration Help",
        lastMessage: "For interceptors, you can use axios.interceptors.request.use()...",
        timestamp: "1 week ago",
        messageCount: 11
      }
    ]
  }
];

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

interface Repo {
  id: string;
  name: string;
  conversationCount: number;
  conversations: Conversation[];
}

function RepoConversationSidebar() {
  const [repos, setRepos] = useState<Repo[]>(dummyRepos);
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const toggleRepoExpand = (repoId: string) => {
    const newExpanded = new Set(expandedRepos);
    if (newExpanded.has(repoId)) {
      newExpanded.delete(repoId);
    } else {
      newExpanded.add(repoId);
    }
    setExpandedRepos(newExpanded);
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Here you would typically navigate to the selected conversation
    console.log("Selected conversation:", conversationId);
  };

  const totalConversations = repos.reduce((acc, repo) => acc + repo.conversationCount, 0);

  return (
    <aside className="flex flex-col border-r border-[#1E2530] bg-[#0d0f14] w-80">
      {/* Header */}
      <div className="border-b border-[#1E2530] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#a8ff3e]" />
            <div className="font-syne-Bold text-[13px] text-white">Repositories</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[12px] text-[#6b7788]">{repos.length} repos</div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-[#1E2530] bg-[#11141C] px-4 py-2">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex gap-3 text-[#6b7788]">
            <div>
              <span className="text-white font-semibold">{repos.length}</span> repos
            </div>
            <div>
              <span className="text-white font-semibold">{totalConversations}</span> conversations
            </div>
          </div>
          <div className="text-[#6b7788]">
            Local
          </div>
        </div>
      </div>

      {/* Repos List */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {repos.map((repo) => (
          <div key={repo.id} className="border border-[#1E2530] rounded-[6px] bg-[#11141C] overflow-hidden">
            {/* Repo Header */}
            <button
              onClick={() => toggleRepoExpand(repo.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#1a2035] transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {expandedRepos.has(repo.id) ? (
                  <ChevronDown className="w-4 h-4 text-[#a8ff3e] flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#6b7788] flex-shrink-0" />
                )}
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-white font-semibold text-[11px] font-syne-Bold truncate">
                    {repo.name}
                  </span>
                  <span className="text-[10px] text-[#6b7788]">
                    {repo.conversationCount} conversation{repo.conversationCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </button>

            {/* Conversations List (Expanded) */}
            {expandedRepos.has(repo.id) && (
              <div className="border-t border-[#1E2530] bg-[#0d0f14]">
                {repo.conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => selectConversation(conversation.id)}
                    className={`w-full flex items-start gap-2 px-3 py-2 hover:bg-[#1a2035] transition-colors border-b border-[#1E2530] last:border-b-0 ${
                      selectedConversation === conversation.id ? 'bg-[#1a2035] border-l-2 border-l-[#a8ff3e]' : ''
                    }`}
                  >
                    <MessageSquare className="w-3 h-3 text-[#6b7788] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-white text-[10px] font-semibold truncate mb-0.5">
                        {conversation.title}
                      </div>
                      <div className="text-[9px] text-[#6b7788] truncate mb-0.5">
                        {conversation.lastMessage}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-[#7a8299]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {conversation.timestamp}
                        </div>
                        <div>•</div>
                        <div>{conversation.messageCount} msgs</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default RepoConversationSidebar;
