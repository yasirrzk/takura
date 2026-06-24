import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, User, ShieldAlert, ShieldCheck, ArrowRight, Lightbulb } from 'lucide-react';
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
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    if (data.username === 'admin' && data.password === 'adminadmin') {
      login({ name: 'Admin Takura', role: 'Administrator' }, 'mock-jwt-token');
      toast.success('Akses Diberikan', {
        description: 'Selamat datang di Manufacturing System PT Takura.',
      });
      navigate('/');
    } else {
      toast.error('Otorisasi Ditolak', {
        description: 'Kombinasi Username & Password tidak terdaftar.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-755 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Light Aesthetic Background Blob Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-slate-550/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle modern line background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[450px] z-10"
      >
        {/* Premium Light Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.1)] p-10 md:p-12 relative overflow-hidden">
          
          {/* Subtle top edge gradient highlighting */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="relative group mb-5">
              {/* Outer soft shadow ring */}
              <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-350" />
              <div className="relative size-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-lg shadow-slate-950/20 mb-1 rotate-3 group-hover:rotate-6 transition-all duration-300">
                <ShieldCheck className="text-white size-8" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              TAKARU <span className="text-xs bg-indigo-50 text-indigo-650 font-extrabold px-2 py-0.5 rounded-md border border-indigo-100/80 align-middle ml-1">SYSTEM</span>
            </h1>
            <p className="text-slate-500 text-sm font-semibold tracking-wide px-2">Sistem Monitoring Siklus Produksi & Gudang</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Username field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  {...register('username')}
                  type="text" 
                  placeholder="Masukkan username admin"
                  className={`w-full bg-slate-50 border-2 ${errors.username ? 'border-red-100 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-indigo-650 focus:bg-white'} rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder-slate-400 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-2 flex items-center">
                  <ShieldAlert size={11} className="mr-1" /> {errors.username.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">Lupa Sandi?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border-2 ${errors.password ? 'border-red-100 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-indigo-650 focus:bg-white'} rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder-slate-400 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-2 flex items-center">
                  <ShieldAlert size={11} className="mr-1" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Login button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 font-black text-sm tracking-wider shadow-lg shadow-slate-900/15 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
            >
              {isSubmitting ? (
                <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>MASUK SISTEM</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.25em]">Otorisasi Terenkripsi &bull; PT Takaru</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
