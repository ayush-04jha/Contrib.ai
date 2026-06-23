import { Hexagon, LogOut } from "lucide-react";
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
    const navigate = useNavigate();

useEffect(() => {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  setUser(storedUser);
}, []);

const handleLogout = async () => {
    try {
        await API.post("/auth/logout");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    } catch (error) {
        console.error("Logout error:", error);
        // Even if the API call fails, clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
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
                            <div className="text-white border border-[#1e2530] rounded-[5px] p-2">
                                {user.name}
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-[#7a8299] hover:text-white border border-[#1e2530] rounded-[5px] p-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <a href="/login" className="text-[#7a8299] hover:text-white border border-[#1e2530] rounded-[5px] p-2 transition-colors">
                                Login
                            </a>
                            <a href="/signup" className="bg-[#a8ff3e] text-black rounded-[5px] p-2 hover:bg-[#bfff6e] transition-colors">
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