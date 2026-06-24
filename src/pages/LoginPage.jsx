import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

// Zod Schema for Validation
const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(5, 'Password minimal 5 karakter'),
});

const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    // Mock login logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (data.username === 'admin' && data.password === 'adminadmin') {
      login({ name: 'Admin Takaru', role: 'Administrator' }, 'mock-jwt-token');
      toast.success('Login Berhasil', {
        description: 'Selamat datang kembali, Admin!',
      });
      navigate('/');
    } else {
      toast.error('Login Gagal', {
        description: 'Username atau Password salah. (Hint: admin / adminadmin)',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10 md:p-12">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="size-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-900/20 mb-6 rotate-3">
              <ShieldCheck className="text-white size-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sign in to Takaru</h1>
            <p className="text-slate-400 font-medium text-sm px-4">Management system for integrated manufacturing cycle.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  {...register('username')}
                  type="text" 
                  placeholder="Enter your username"
                  className={`w-full bg-slate-50 border-2 ${errors.username ? 'border-red-100 focus:border-red-500' : 'border-transparent focus:border-indigo-600'} rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all outline-none focus:bg-white`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-2">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-tight">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border-2 ${errors.password ? 'border-red-100 focus:border-red-500' : 'border-transparent focus:border-indigo-600'} rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all outline-none focus:bg-white`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-2">{errors.password.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center space-x-2 group"
            >
              {isSubmitting ? (
                <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Secure Session Powered by Takaru</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
