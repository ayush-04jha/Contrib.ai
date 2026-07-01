import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import API from "../../axiosSetup/API";

function GoogleCallback() {
    const [statusMessage, setStatusMessage] = useState("Authenticating with Google, please wait...");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            API.post('/auth/google-login', { code })
                .then(async (res) => {
                    setStatusMessage("Checking repository data...");
                    if (res.data?.user) {
                        localStorage.setItem("user", JSON.stringify(res.data.user));
                    }
                    try {
                        // Check if user has existing repos (Same as normal login logic)
                        const reposRes = await API.get("/user/repos");

                        if (reposRes.data?.count > 0) {
                            const firstRepo = reposRes.data.repos[0];
                            navigate(`/chatbox/${firstRepo.jobId}`);
                        } else {
                            navigate("/pastelink");
                        }
                    } catch (repoErr) {
                        console.error("Failed to fetch user repos, sending to fallback:", repoErr);
                        navigate("/pastelink");
                    }

                })
                .catch(err => {
                    console.error("Google Authentication Failed:", err);

                    // 🌟 YEH ALERT LINE ADD KARO DEBUGGING KE LIYE
                    alert(`OAuth Failed! Message: ${err.message}. Response: ${JSON.stringify(err.response?.data)}`);
                    
                    // navigate('/login?error=oauth_failed');
                });
        }
        else {
            console.log("is this running?");
            
            // navigate('/login');
        }
    }, [searchParams, navigate])

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-6">
            <div className="w-8 h-8 border-4 border-[#a8ff3e] border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-[#8a8f98] text-sm font-medium">{statusMessage}</div>
        </div>
    )
}

export default GoogleCallback