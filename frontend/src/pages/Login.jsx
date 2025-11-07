// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';

// // Real API function (unchanged)
// const loginAPI = async (email, password) => {
//   try {
//     const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       return { success: false, error: result.error || 'Login failed' };
//     }

//     return { success: true, token: result.token, userType: result.userType };
//   } catch (error) {
//     throw new Error('Network error. Please try again.');
//   }
// };

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [mounted, setMounted] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const handleInputChange = useCallback(
//     (e) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//       if (error) {
//         setError('');
//       }
//     },
//     [error]
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.email.trim() || !formData.password.trim()) {
//       setError('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       const result = await loginAPI(formData.email.trim(), formData.password);

//       if (result.success) {
//         // Map backend userType to frontend roles
//         const userTypeMap = {
//           Admin: 'admin',
//           Anish: 'Anish',
//           'Aakash Chouhan': 'Aakash Chouhan',
//           'Ravi Rajak': 'Ravi Rajak',
//           'Anjali Malviya': 'Anjali Malviya',
//           'Neha Masani': 'Neha Masani',
//           'Gourav Singh': 'Gourav Singh',
//           'Somesh Chadhar': 'Somesh Chadhar',
//         };
//         const frontendUserType = userTypeMap[result.userType] || 'user';

//         // Save to localStorage
//         localStorage.setItem('token', result.token);
//         localStorage.setItem('userType', frontendUserType);
//         console.log('Saved to localStorage:', { token: result.token, userType: frontendUserType });

//         navigate('/dashboard');
//       } else {
//         setError(result.error || 'Login failed');
//       }
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Floating soft blobs (memoized)
//   const FloatingBlobs = React.memo(() => (
//     <>
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         {[...Array(3)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute rounded-2xl opacity-25 blur-3xl"
//             style={{
//               width: `${140 + i * 60}px`,
//               height: `${120 + i * 60}px`,
//               left: `${10 + i * 28}%`,
//               top: `${8 + i * 24}%`,
//               background: `radial-gradient(closest-side, rgba(56,189,248,0.22), rgba(14,165,233,0.12))`,
//               transformOrigin: 'center',
//               animation: `blobFloat${i} ${8 + i * 2}s ease-in-out infinite`,
//               animationDelay: `${i * 0.6}s`,
//             }}
//           />
//         ))}
//       </div>
//     </>
//   ));

//   // Subtle particle dots
//   const ParticleSpecks = React.memo(() => (
//     <>
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         {[...Array(24)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute rounded-full"
//             style={{
//               width: `${1 + (i % 3)}px`,
//               height: `${1 + (i % 3)}px`,
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               background: `rgba(99,102,241, ${0.08 + Math.random() * 0.18})`,
//               animation: `speck ${3 + Math.random() * 4}s ease-in-out infinite`,
//               animationDelay: `${Math.random() * 2}s`,
//             }}
//           />
//         ))}
//       </div>
//     </>
//   ));

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-800 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
//       <FloatingBlobs />
//       <ParticleSpecks />

//       {/* soft grid overlay */}
//       <div className="absolute inset-0 opacity-8">
//         <div
//           className="w-full h-full"
//           style={{
//             backgroundImage: `
//               linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px),
//               linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
//             `,
//             backgroundSize: '60px 60px',
//             animation: 'gridDrift 28s linear infinite',
//           }}
//         />
//       </div>

//       {/* accent blurred blobs */}
//       <div className="absolute top-16 left-12 w-72 h-72 bg-sky-500/10 rounded-full blur-2xl" />
//       <div className="absolute bottom-16 right-12 w-64 h-64 bg-indigo-500/8 rounded-full blur-2xl" />

//       <div className="relative z-10 w-full max-w-md transform transition-all duration-700 ease-out">
//         <div
//           className={`transform transition-all duration-700 ease-out ${
//             mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
//           }`}
//         >
//           <div className="relative bg-slate-800/70 rounded-2xl border border-slate-700/50 shadow-xl p-8 backdrop-blur-md overflow-hidden">
//             {/* subtle inner gradient */}
//             <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(20,83,127,0.03), rgba(8,32,50,0.02))' }} />

//             <div className="relative z-10">
//               <div className="text-center mb-6">
//                 <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-inner">
//                   <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
//                     <img src="/rcc-logo.png" alt="RCC Logo" className="w-10 h-10 object-contain" />
//                   </div>
//                 </div>
//                 <h1 className="text-4xl font-extrabold text-sky-200 mt-4">Welcome Back</h1>
//                 <p className="text-slate-300 mt-1">Sign in to continue your journey</p>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-5">
//                 <div className="space-y-4">
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     placeholder="Enter your email"
//                     className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition"
//                     required
//                     autoComplete="email"
//                     disabled={isLoading}
//                   />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     placeholder="Enter your password"
//                     className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition"
//                     required
//                     autoComplete="current-password"
//                     disabled={isLoading}
//                   />
//                 </div>

//                 {error && (
//                   <div className="text-amber-200 text-sm text-center bg-amber-900/20 border border-amber-700/20 rounded-lg p-3">
//                     <span className="block">⚠️ {error}</span>
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
//                   className={`w-full py-3 rounded-lg font-semibold text-lg text-white transition transform ${
//                     isLoading || !formData.email.trim() || !formData.password.trim()
//                       ? 'bg-slate-600 cursor-not-allowed opacity-60'
//                       : 'bg-gradient-to-r from-sky-400 to-indigo-500 hover:scale-[1.02] shadow-lg'
//                   }`}
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center justify-center space-x-3">
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       <span>Signing In...</span>
//                     </div>
//                   ) : (
//                     <span>✨ Sign In</span>
//                   )}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* global styles / keyframes */}
//       <style>{`
//         @keyframes blobFloat0 {
//           0%,100% { transform: translateY(0px) scale(1); }
//           50% { transform: translateY(-18px) scale(1.05) rotate(6deg); }
//         }
//         @keyframes blobFloat1 {
//           0%,100% { transform: translateY(0px) scale(1); }
//           50% { transform: translateY(-22px) scale(1.06) rotate(-4deg); }
//         }
//         @keyframes blobFloat2 {
//           0%,100% { transform: translateY(0px) scale(1); }
//           50% { transform: translateY(-26px) scale(1.07) rotate(8deg); }
//         }

//         @keyframes speck {
//           0%,100% { opacity: 0.08; transform: scale(1); }
//           50% { opacity: 0.28; transform: scale(1.4); }
//         }

//         @keyframes gridDrift {
//           0% { transform: translate(0, 0); }
//           100% { transform: translate(40px, 40px); }
//         }

//         /* small UI polish */
//         input:focus {
//           box-shadow: 0 6px 18px rgba(14,165,233,0.06) !important;
//         }

//         ::-webkit-scrollbar {
//           width: 8px;
//         }
//         ::-webkit-scrollbar-track {
//           background: rgba(0, 0, 0, 0.08);
//           border-radius: 10px;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: linear-gradient(45deg, #0ea5e9, #6366f1);
//           border-radius: 10px;
//         }
//         @media (max-width: 768px) {
//           .max-w-md { padding: 0 12px; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;









// src/pages/Login.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../features/auth/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [mounted, setMounted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) return;

    const result = await dispatch(
      loginUser({ email: formData.email.trim(), password: formData.password })
    );

    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  // Memoized UI components
  const FloatingBlobs = React.memo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-2xl opacity-25 blur-3xl"
          style={{
            width: `${140 + i * 60}px`,
            height: `${120 + i * 60}px`,
            left: `${10 + i * 28}%`,
            top: `${8 + i * 24}%`,
            background: `radial-gradient(closest-side, rgba(56,189,248,0.22), rgba(14,165,233,0.12))`,
            animation: `blobFloat${i} ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </div>
  ));

  const ParticleSpecks = React.memo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(99,102,241, ${0.08 + Math.random() * 0.18})`,
            animation: `speck ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-800 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingBlobs />
      <ParticleSpecks />

      <div className="absolute inset-0 opacity-8">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'gridDrift 28s linear infinite',
          }}
        />
      </div>

      <div className="absolute top-16 left-12 w-72 h-72 bg-sky-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-16 right-12 w-64 h-64 bg-indigo-500/8 rounded-full blur-2xl" />

      <div className="relative z-10 w-full max-w-md transform transition-all duration-700 ease-out">
        <div className={`transform transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <div className="relative bg-slate-800/70 rounded-2xl border border-slate-700/50 shadow-xl p-8 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(20,83,127,0.03), rgba(8,32,50,0.02))' }} />

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                    <img src="/rcc-logo.png" alt="RCC Logo" className="w-10 h-10 object-contain" />
                  </div>
                </div>
                <h1 className="text-4xl font-extrabold text-sky-200 mt-4">Welcome Back</h1>
                <p className="text-slate-300 mt-1">Sign in to continue your journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="text-amber-200 text-sm text-center bg-amber-900/20 border border-amber-700/20 rounded-lg p-3">
                    <span className="block">Warning: {error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                  className={`w-full py-3 rounded-lg font-semibold text-lg text-white transition transform ${
                    isLoading || !formData.email.trim() || !formData.password.trim()
                      ? 'bg-slate-600 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-sky-400 to-indigo-500 hover:scale-[1.02] shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blobFloat0 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-18px) scale(1.05) rotate(6deg); } }
        @keyframes blobFloat1 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-22px) scale(1.06) rotate(-4deg); } }
        @keyframes blobFloat2 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-26px) scale(1.07) rotate(8deg); } }
        @keyframes speck { 0%,100% { opacity: 0.08; transform: scale(1); } 50% { opacity: 0.28; transform: scale(1.4); } }
        @keyframes gridDrift { 0% { transform: translate(0, 0); } 100% { transform: translate(40px, 40px); } }
        input:focus { box-shadow: 0 6px 18px rgba(14,165,233,0.06) !important; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.08); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(45deg, #0ea5e9, #6366f1); border-radius: 10px; }
        @media (max-width: 768px) { .max-w-md { padding: 0 12px; } }
      `}</style>
    </div>
  );
};

export default Login;