import { Hexagon, LogOut, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../axiosSetup/API";

interface User {
  id: string;
  name: string;
  email: string;
}

function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [repoId, setRepoId] = useState<string | null>(null);
    const navigate = useNavigate();

useEffect(() => {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  setUser(storedUser);
  // Get the last accessed repoId from localStorage
  const storedRepoId = localStorage.getItem("repoId");
  setRepoId(storedRepoId);
}, []);

const handleLogout = async () => {
    try {
        await API.post("/auth/logout");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("repoId");
        setUser(null);
        setRepoId(null);
        navigate("/");
    } catch (error) {
        console.error("Logout error:", error);
        // Even if the API call fails, clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("repoId");
        setUser(null);
        setRepoId(null);
        navigate("/");
    }
};

const handleGoToChatbox = async () => {
    try {
        // Try to get user's repos
        const reposRes = await API.get("/user/repos");
        
        if (reposRes.data?.count > 0) {
            // User has repos, navigate to the first one
            const firstRepo = reposRes.data.repos[0];
            navigate(`/chatbox/${firstRepo.jobId}`);
        } else {
            // No repos, navigate to link drop
            navigate("/pastelink");
        }
    } catch (error) {
        console.error("Error fetching repos:", error);
        // Fallback to link drop
        navigate("/pastelink");
    }
};

    return (
        <div className="bg-[#0d0f14] border-b-2 border-[#1e2530] flex items-center py-5 px-11  justify-between">
            {/* left part */}
            <div className="left flex justify-between space-x-1">
                {/* icon */}
                <div className="icon flex justify-center items-center h-8 w-8 rounded-tl-[25%] rounded-tr-[25%] rounded-br-[25%] rounded-bl-[25%] bg-[#a8ff3e]">
                    <Hexagon className="w-[50%] h-[50%] text-black" />
                </div>
                {/* company name */}
                <div className="text-white flex">
                    <h1>contrib</h1>
                    <h1 className="text-[#a8ff3e]" >.ai</h1>
                </div>
            </div>
            {/* middle part */}
            <div className="space-x-7">
                <a href="" className="text-[#7a8299] ">Features</a>
                <a href="" className="text-[#7a8299]">How it works</a>
                <a href="" className="text-[#7a8299] ">Docs</a>

            </div>
            {/* button */}
            <div className="flex space-x-1">
                {
                    user ? (
                        <div className="flex items-center space-x-3">
                            {/* Go to Chatbox button for logged-in users */}
                            <button
                                onClick={handleGoToChatbox}
                                className="flex items-center space-x-1 text-[#a8ff3e] hover:text-[#bfff6e] border border-[#1e2530] rounded-[5px] p-2 transition-all duration-300 hover:border-[#a8ff3e] hover:shadow-[0_0_15px_rgba(168,255,62,0.3)] hover:scale-105"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Chat</span>
                            </button>
                            
                            <div className="text-white border border-[#1e2530] rounded-[5px] p-2">
                                {user.name}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-[#7a8299] hover:text-white border border-[#1e2530] rounded-[5px] p-2 transition-all duration-300 hover:border-[#a8ff3e] hover:shadow-[0_0_15px_rgba(168,255,62,0.3)] hover:scale-105"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <a href="/login" className="text-[#7a8299] hover:text-white border border-[#1e2530] rounded-[5px] p-2 transition-all duration-300 hover:border-[#a8ff3e] hover:shadow-[0_0_15px_rgba(168,255,62,0.3)] hover:scale-105">
                                Login
                            </a>
                            <a href="/signup" className="bg-[#a8ff3e] text-black rounded-[5px] p-2 hover:bg-[#bfff6e] transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,255,62,0.3)] hover:scale-105">
                                Sign Up
                            </a>
                        </>
                    )
                }
            </div>

        </div>
    )
}

export default Navbar