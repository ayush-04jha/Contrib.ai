import { useState } from "react";
import API from "../../../axiosSetup/API";
import { useNavigate } from "react-router-dom";
export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/signup", {
        username,
        email,
        password,
      });
   if (
  res.data?.success &&
  res.data?.token
) {
  localStorage.setItem(
    "token",
    res.data.token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(res.data.user)
  );

  // Check if user has existing repos (should be 0 for new users)
  try {
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
  } catch (reposErr) {
    // If checking repos fails, default to link drop
    navigate("/pastelink");
  }
} else {
  setError(
    res.data?.message ||
    "Signup failed"
  );
}
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong"
      );
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

        <h1 className="text-white text-3xl font-bold mb-2">
          Create Account
        </h1>

        <p className="text-[#8a8f98] text-sm mb-8">
          Join contrib.ai and start contributing today.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Username */}
          <label className="block text-[#c5c9d0] text-sm mb-2">
            Username
          </label>

          <input
            type="text"
            value={username}
            required
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="ayushjha"
            className="w-full px-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white outline-none focus:border-[#a8ff3e] mb-4"
          />

          {/* Email */}
          <label className="block text-[#c5c9d0] text-sm mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            required
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
            className="w-full px-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white outline-none focus:border-[#a8ff3e] mb-4"
          />

          {/* Password */}
          <label className="block text-[#c5c9d0] text-sm mb-2">
            Password
          </label>

          <div className="relative mb-4">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              required
              minLength={6}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-3 pr-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white outline-none focus:border-[#a8ff3e]"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8ff3e] text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm Password */}
          <label className="block text-[#c5c9d0] text-sm mb-2">
            Confirm Password
          </label>

          <div className="relative">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              required
              minLength={8}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Re-enter password"
              className="w-full px-3 py-3 pr-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white outline-none focus:border-[#a8ff3e]"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8ff3e] text-sm"
            >
              {showConfirmPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <p
              className={`text-sm mt-2 ${
                passwordsMatch
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {passwordsMatch
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-lg bg-[#a8ff3e] text-black font-semibold hover:bg-[#bfff6e] transition-all duration-300 disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[#8a8f98] text-sm mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#a8ff3e] hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}