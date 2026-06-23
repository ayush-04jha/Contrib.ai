import { useState } from "react";
import API from "../../../axiosSetup/API";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      if (res.data?.success && res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Check if user has existing repos
        const reposRes = await API.get("/user/repos", {
          headers: {
            Authorization: `Bearer ${res.data.token}`,
          },
        });

        if (reposRes.data?.count > 0) {
          // User has repos, navigate to chatbox with the first repo
          const firstRepo = reposRes.data.repos[0];
          navigate(`/chatbox/${firstRepo.jobId}`);
        } else {
          // No repos, navigate to link drop
          navigate("/pastelink");
        }
      } else {
        setError(res.data?.message || "Login failed");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#a8ff3e] rounded-md flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-black rounded-sm" />
          </div>

          <span className="text-white text-lg font-bold">
            contrib<span className="text-[#a8ff3e]">.ai</span>
          </span>
        </div>

        <h1 className="text-white text-3xl font-bold mb-2">Welcome Back</h1>

        <p className="text-[#8a8f98] text-sm mb-8">
          Login to access your repositories and conversations.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <label className="block text-[#c5c9d0] text-sm mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white outline-none focus:border-[#a8ff3e] mb-4"
          />

          {/* Password */}
          <label className="block text-[#c5c9d0] text-sm mb-2">
            Password
          </label>

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-3 pr-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white outline-none focus:border-[#a8ff3e]"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8ff3e] text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 text-red-400 text-sm">{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-lg bg-[#a8ff3e] text-black font-semibold hover:bg-[#bfff6e] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-[#8a8f98] text-sm mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-[#a8ff3e] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}