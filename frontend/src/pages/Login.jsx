import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
          </span>
          <span className="font-display font-semibold text-white text-lg tracking-tight">
            ScamShield
          </span>
        </div>

        <div>
          <h2 className="font-display text-4xl font-semibold text-white leading-tight mb-4">
            AI that reads
            <br />
            between the lines.
          </h2>
          <p className="text-slate-400 max-w-sm">
            Scan messages, emails, URLs, and full conversations for scam
            patterns — with explainable risk scores, not just a verdict.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-slate-500">
          <span>🟢 SAFE</span>
          <span>🟡 SUSPICIOUS</span>
          <span>🔴 HIGH RISK</span>
        </div>

        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-brand to-transparent animate-scanline" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-paper p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            <span className="font-display font-semibold text-ink text-lg">
              ScamShield
            </span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Log in to your account to continue.
          </p>

          {error && (
            <p className="text-danger text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border bg-surface rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            required
          />

          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-surface rounded-lg px-3 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white py-2.5 rounded-lg font-medium text-sm hover:bg-ink-soft transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-sm text-center mt-6 text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-deep font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}