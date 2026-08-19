import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/register", {
        username,
        email,
        password,
        role: "user",
      });

      alert("Account created successfully!");

      navigate("/login");
    } catch (error: any) {
      alert(error.response?.data?.detail || "Registration failed");
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-slate-400 text-center mt-2">
          Join Oratio AI today
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold transition"
          >
            Create Account
          </button>

          <p className="mt-6 text-center text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
}