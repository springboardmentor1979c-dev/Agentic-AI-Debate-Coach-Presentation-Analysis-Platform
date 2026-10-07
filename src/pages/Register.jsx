import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Eye, EyeOff, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setApiError('');
    setSuccess(false);
    setLoading(true);
    const result = await registerUser(data.name, data.email, data.password, data.role);
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#05020c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-950/30 mb-3">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-wide text-white">CREATE ACCOUNT</h2>
          <p className="text-xs text-slate-400 mt-1 font-light">Join the presentation and debate coaching platform</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel border border-white/5 p-8 rounded-3xl shadow-2xl relative">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
              <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
              <p className="text-slate-400 text-xs">Redirecting you to the login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* API Errors */}
              {apiError && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition duration-200 ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-purple-500/70 focus:bg-white/[0.08]'
                    }`}
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 1, message: 'Name must be filled' },
                    })}
                  />
                </div>
                {errors.name && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.name.message}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition duration-200 ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-purple-500/70 focus:bg-white/[0.08]'
                    }`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.email.message}</span>
                )}
              </div>

              {/* Role Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide block">Select Role</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-purple-500/70 focus:bg-white/[0.08] cursor-pointer"
                  {...register('role', { required: 'Role is required' })}
                >
                  <option className="bg-[#120b24] text-white" value="Learner">Learner</option>
                  <option className="bg-[#120b24] text-white" value="Coach">Debate Coach</option>
                  <option className="bg-[#120b24] text-white" value="Educator">Educator</option>
                  <option className="bg-[#120b24] text-white" value="Admin">Administrator</option>
                </select>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none transition duration-200 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-purple-500/70 focus:bg-white/[0.08]'
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.password.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-purple-950/30 text-sm glow-btn cursor-pointer flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Login Redirect */}
          <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/5 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
