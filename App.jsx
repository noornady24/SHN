import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Atom, User, ShieldCheck, LogOut, BookOpen, 
  PlayCircle, FileText, CheckCircle, XCircle, 
  Clock, Award, BarChart, ChevronRight, Plus, 
  Trash2, Search, GraduationCap, Lock
} from 'lucide-react';

// --- DATA & CONFIGURATION ---

const ADMIN_EMAIL = "noornady00@gmail.com";
const ADMIN_PASS = "noornady2007";

const INITIAL_SUBJECTS = Array.from({ length: 20 }, (_, i) => ({
  id: `subj-${i + 1}`,
  title: [
    "Calculus I", "Linear Algebra", "Abstract Algebra", "Real Analysis", 
    "Complex Analysis", "Differential Equations", "Topology", "Number Theory",
    "Discrete Mathematics", "Probability Theory", "Statistics", "Numerical Analysis",
    "Geometry", "History of Math", "Mathematical Logic", "Set Theory",
    "Functional Analysis", "Combinatorics", "Cryptography", "Applied Mathematics"
  ][i] || `Mathematics Subject ${i + 1}`,
  description: "Advanced concepts and theories in mathematics education.",
  materials: [], // { type: 'video' | 'link' | 'file', title, url }
  exams: [] // { title, questions: [] }
}));

const INITIAL_ADMIN = {
  id: 'admin-1',
  name: 'Noor Nady (Supervisor)',
  email: ADMIN_EMAIL,
  role: 'admin',
  status: 'approved'
};

// --- COMPONENTS ---

// 1. COSMIC BACKGROUND
const StarBackground = () => {
  // Generate static stars to prevent hydration mismatches
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-slate-950 overflow-hidden pointer-events-none">
      {/* Nebula Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.2),transparent_70%)]" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px]" />

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full shadow-[0_0_5px_white]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// 2. UI COMPONENTS
const GlassCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const NeonButton = ({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] border border-cyan-400/30",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40",
    danger: "bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
    success: "bg-green-500/20 text-green-200 border border-green-500/50 hover:bg-green-500/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const InputField = ({ label, type, placeholder, value, onChange, required = false }) => (
  <div className="mb-4">
    <label className="block text-cyan-200 text-sm font-semibold mb-2 ml-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
    />
  </div>
);

// --- MAIN APPLICATION COMPONENT ---

export default function App() {
  // --- STATE ---
  const [view, setView] = useState('landing'); // landing, login, signup, student-dash, admin-dash, course-view
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [notification, setNotification] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load data from LocalStorage or seed defaults
    const storedUsers = JSON.parse(localStorage.getItem('minia_users') || '[]');
    const storedCourses = JSON.parse(localStorage.getItem('minia_courses') || '[]');

    if (storedUsers.length === 0) {
      setUsers([INITIAL_ADMIN]);
      localStorage.setItem('minia_users', JSON.stringify([INITIAL_ADMIN]));
    } else {
      setUsers(storedUsers);
    }

    if (storedCourses.length === 0) {
      setCourses(INITIAL_SUBJECTS);
      localStorage.setItem('minia_courses', JSON.stringify(INITIAL_SUBJECTS));
    } else {
      setCourses(storedCourses);
    }
  }, []);

  // --- PERSISTENCE HELPERS ---
  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem('minia_users', JSON.stringify(newUsers));
  };

  const saveCourses = (newCourses) => {
    setCourses(newCourses);
    localStorage.setItem('minia_courses', JSON.stringify(newCourses));
  };

  // --- ACTIONS ---
  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    
    // Check Admin Hardcode
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setCurrentUser(INITIAL_ADMIN);
      setView('admin-dash');
      return;
    }

    if (user) {
      if (user.role === 'admin') {
        setCurrentUser(user);
        setView('admin-dash');
      } else {
        if (user.status === 'approved') {
          setCurrentUser(user);
          setView('student-dash');
        } else {
          showNotification("Account Pending Approval from Supervisor.", "error");
        }
      }
    } else {
      showNotification("Invalid Credentials.", "error");
    }
  };

  const handleSignup = (data) => {
    if (users.some(u => u.email === data.email)) {
      showNotification("Email already registered.", "error");
      return;
    }
    const newUser = { ...data, id: Date.now().toString(), role: 'student', status: 'pending', progress: {} };
    saveUsers([...users, newUser]);
    showNotification("Registration successful! Waiting for approval.", "success");
    setView('landing');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('landing');
    setSelectedCourseId(null);
  };

  // --- VIEWS ---

  // 1. LANDING PAGE
  if (view === 'landing') {
    return (
      <div className="min-h-screen text-white relative font-sans selection:bg-cyan-500/30">
        <StarBackground />
        <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-center items-center">
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <div className="inline-block p-4 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-white/10 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Atom size={64} className="text-cyan-300" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-white to-purple-200 mb-4 tracking-tight">
              Minia University
            </h1>
            <h2 className="text-2xl md:text-3xl text-cyan-100/80 font-light">
              Faculty of Education • Mathematics Department
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Student Card */}
            <GlassCard className="hover:scale-105 transition-transform duration-300 cursor-pointer group flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-blue-500/20 mb-4 group-hover:bg-blue-500/30 transition-colors">
                <User size={40} className="text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Student Portal</h3>
              <p className="text-slate-300 mb-6">Access courses, exams, and resources.</p>
              <div className="flex gap-4 w-full">
                <NeonButton variant="secondary" className="flex-1" onClick={() => setView('login')}>Login</NeonButton>
                <NeonButton className="flex-1" onClick={() => setView('signup')}>Join Now</NeonButton>
              </div>
            </GlassCard>

            {/* Supervisor Card */}
            <GlassCard className="hover:scale-105 transition-transform duration-300 cursor-pointer group flex flex-col items-center text-center" delay={0.2}>
               <div className="p-4 rounded-full bg-purple-500/20 mb-4 group-hover:bg-purple-500/30 transition-colors">
                <ShieldCheck size={40} className="text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Supervisor Access</h3>
              <p className="text-slate-300 mb-6">Manage students, content, and analytics.</p>
              <NeonButton variant="secondary" className="w-full" onClick={() => setView('login-admin')}>
                Secure Login
              </NeonButton>
            </GlassCard>
          </div>
        </div>
        <NotificationToast notification={notification} />
      </div>
    );
  }

  // 2. AUTH PAGES (Login/Signup)
  if (['login', 'login-admin', 'signup'].includes(view)) {
    return (
      <div className="min-h-screen text-white relative flex items-center justify-center p-4">
        <StarBackground />
        <GlassCard className="w-full max-w-md relative z-10">
          <button onClick={() => setView('landing')} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <XCircle />
          </button>
          
          <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            {view === 'signup' ? 'Student Registration' : view === 'login-admin' ? 'Supervisor Login' : 'Student Login'}
          </h2>

          {view === 'signup' ? (
            <SignupForm onSubmit={handleSignup} onSwitch={() => setView('login')} />
          ) : (
            <LoginForm 
              isAdmin={view === 'login-admin'} 
              onSubmit={handleLogin} 
              onSwitch={() => setView(view === 'login-admin' ? 'login' : 'signup')} 
            />
          )}
        </GlassCard>
        <NotificationToast notification={notification} />
      </div>
    );
  }

  // 3. STUDENT DASHBOARD
  if (view === 'student-dash') {
    return (
      <DashboardLayout currentUser={currentUser} onLogout={handleLogout}>
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">My Courses</h2>
              <p className="text-cyan-200/60">Select a subject to start learning.</p>
            </div>
            <div className="hidden md:block">
               <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                 Academic Year: {currentUser.grade}
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, idx) => (
              <GlassCard 
                key={course.id} 
                className="hover:bg-white/10 transition-colors group cursor-pointer h-full flex flex-col justify-between"
                delay={idx * 0.05}
              >
                <div onClick={() => { setSelectedCourseId(course.id); setView('course-view'); }}>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                    <BookOpen size={24} className="text-cyan-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-white/5 pt-4">
                  <span className="flex items-center gap-1"><FileText size={12}/> {course.materials.length} Resources</span>
                  <span className="flex items-center gap-1"><Award size={12}/> {course.exams.length} Exams</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 4. COURSE VIEW (Student)
  if (view === 'course-view' && selectedCourseId) {
    const course = courses.find(c => c.id === selectedCourseId);
    return (
      <DashboardLayout currentUser={currentUser} onLogout={handleLogout} showBack onBack={() => setView('student-dash')}>
        <CourseViewer course={course} />
      </DashboardLayout>
    );
  }

  // 5. ADMIN DASHBOARD
  if (view === 'admin-dash') {
    return (
      <DashboardLayout currentUser={currentUser} onLogout={handleLogout}>
        <AdminPanel 
          users={users} 
          setUsers={saveUsers} 
          courses={courses} 
          setCourses={saveCourses} 
        />
      </DashboardLayout>
    );
  }

  return null;
}

// --- SUB-COMPONENTS & MODULES ---

const NotificationToast = ({ notification }) => {
  if (!notification) return null;
  const isError = notification.type === 'error';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-3 ${
        isError ? 'bg-red-900/80 text-red-100' : 'bg-green-900/80 text-green-100'
      }`}
    >
      {isError ? <XCircle size={20} /> : <CheckCircle size={20} />}
      <span className="font-medium">{notification.msg}</span>
    </motion.div>
  );
};

const SignupForm = ({ onSubmit, onSwitch }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', grade: 'Year 1' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField label="Full Name" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      <InputField label="Email Address" type="email" placeholder="student@minia.edu.eg" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
      <InputField label="Mobile Number" type="tel" placeholder="01xxxxxxxxx" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} required />
      <InputField label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
      
      <div className="mb-6">
        <label className="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Academic Year</label>
        <select 
          value={form.grade}
          onChange={e => setForm({...form, grade: e.target.value})}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
        >
          {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
        </select>
      </div>

      <NeonButton type="submit" className="w-full mb-4">Register Account</NeonButton>
      <div className="text-center text-sm text-slate-400">
        Already have an account? <button type="button" onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300 underline">Login</button>
      </div>
    </form>
  );
};

const LoginForm = ({ onSubmit, isAdmin, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(email, password); }}>
      <InputField label="Email" type="email" placeholder="email@address.com" value={email} onChange={e => setEmail(e.target.value)} required />
      <InputField label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
      
      <NeonButton type="submit" className="w-full mb-4">{isAdmin ? 'Verify & Access' : 'Login'}</NeonButton>
      {!isAdmin && (
        <div className="text-center text-sm text-slate-400">
          New Student? <button type="button" onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300 underline">Register</button>
        </div>
      )}
    </form>
  );
};

const DashboardLayout = ({ children, currentUser, onLogout, showBack, onBack }) => (
  <div className="min-h-screen text-white relative font-sans">
    <StarBackground />
    <div className="relative z-10 flex flex-col h-screen">
      {/* Header */}
      <header className="h-20 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 shrink-0">
        <div className="flex items-center gap-4">
          {showBack && (
             <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
               <ChevronRight className="rotate-180" />
             </button>
          )}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-500 p-2 rounded-lg">
              <Atom size={24} className="text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-lg leading-tight">Minia University</h1>
              <p className="text-xs text-cyan-200/70">Mathematics Department</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="font-bold text-sm">{currentUser.name}</div>
            <div className="text-xs text-cyan-400 uppercase tracking-wider">{currentUser.role === 'admin' ? 'Supervisor' : currentUser.grade}</div>
          </div>
          <button onClick={onLogout} className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  </div>
);

// --- ADMIN PANELS ---

const AdminPanel = ({ users, setUsers, courses, setCourses }) => {
  const [tab, setTab] = useState('requests'); // requests, courses, exams, stats

  // Filter users
  const pendingUsers = users.filter(u => u.status === 'pending');
  const allStudents = users.filter(u => u.role === 'student');

  const approveUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'approved' } : u));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Supervisor Dashboard</h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
        {[
          { id: 'requests', icon: User, label: 'Requests', count: pendingUsers.length },
          { id: 'courses', icon: BookOpen, label: 'Courses' },
          { id: 'exams', icon: FileText, label: 'Exam Builder' },
          { id: 'stats', icon: BarChart, label: 'Analytics' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              tab === item.id 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} />
            {item.label}
            {item.count > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 'requests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-cyan-200">Pending Approvals ({pendingUsers.length})</h3>
              {pendingUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">No pending requests</div>
              ) : (
                <div className="grid gap-4">
                  {pendingUsers.map(user => (
                    <GlassCard key={user.id} className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-500/20 p-3 rounded-full text-orange-300">
                          <Clock size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{user.name}</h4>
                          <p className="text-sm text-slate-400">{user.email} • {user.grade}</p>
                          <p className="text-xs text-slate-500">Mobile: {user.mobile}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <NeonButton variant="success" onClick={() => approveUser(user.id)} className="flex-1 md:flex-none">Approve</NeonButton>
                        <NeonButton variant="danger" onClick={() => deleteUser(user.id)} className="flex-1 md:flex-none">Reject</NeonButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              <h3 className="text-xl font-semibold text-cyan-200 mt-12">All Students ({allStudents.length})</h3>
               <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-white/5 text-white">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Grade</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allStudents.map(s => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="p-4 font-medium text-white">{s.name}</td>
                        <td className="p-4">{s.grade}</td>
                        <td className="p-4">{s.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${s.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'courses' && <AdminCourseManager courses={courses} setCourses={setCourses} />}
          
          {tab === 'exams' && <AdminExamBuilder courses={courses} setCourses={setCourses} />}
          
          {tab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="text-center py-12">
                <div className="text-5xl font-bold text-cyan-300 mb-2">{allStudents.length}</div>
                <div className="text-slate-400">Total Students</div>
              </GlassCard>
              <GlassCard className="text-center py-12">
                <div className="text-5xl font-bold text-purple-300 mb-2">{courses.length}</div>
                <div className="text-slate-400">Active Subjects</div>
              </GlassCard>
              <GlassCard className="text-center py-12">
                <div className="text-5xl font-bold text-green-300 mb-2">
                  {courses.reduce((acc, c) => acc + c.exams.length, 0)}
                </div>
                <div className="text-slate-400">Exams Created</div>
              </GlassCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const AdminCourseManager = ({ courses, setCourses }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id);
  const [newMaterial, setNewMaterial] = useState({ type: 'video', title: '', url: '' });

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const addMaterial = (e) => {
    e.preventDefault();
    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseId) {
        return { ...c, materials: [...c.materials, { ...newMaterial, id: Date.now() }] };
      }
      return c;
    });
    setCourses(updatedCourses);
    setNewMaterial({ type: 'video', title: '', url: '' });
  };

  const removeMaterial = (matId) => {
    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseId) {
        return { ...c, materials: c.materials.filter(m => m.id !== matId) };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Sidebar Selector */}
      <div className="md:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {courses.map(c => (
          <div 
            key={c.id} 
            onClick={() => setSelectedCourseId(c.id)}
            className={`p-4 rounded-xl cursor-pointer border transition-all ${
              selectedCourseId === c.id 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-white' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <h4 className="font-semibold">{c.title}</h4>
            <div className="text-xs opacity-70 mt-1">{c.materials.length} Materials</div>
          </div>
        ))}
      </div>

      {/* Editor */}
      <GlassCard className="md:col-span-2">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-cyan-400">Editing:</span> {selectedCourse.title}
        </h3>

        {/* Add Form */}
        <form onSubmit={addMaterial} className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Add Learning Content</h4>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1 ml-1 text-slate-400">Content Type</label>
              <select 
                value={newMaterial.type}
                onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}
                className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="video">YouTube Video</option>
                <option value="link">Google Drive / External Link</option>
                <option value="file">File Download</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 ml-1 text-slate-400">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Lecture 1 Intro" 
                value={newMaterial.title}
                onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                required
                className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="mb-4">
             <label className="block text-xs mb-1 ml-1 text-slate-400">URL / Link</label>
             <input 
                type="url" 
                placeholder="https://..." 
                value={newMaterial.url}
                onChange={e => setNewMaterial({...newMaterial, url: e.target.value})}
                required
                className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
          </div>
          <NeonButton type="submit" variant="primary" className="w-full">Add to Course</NeonButton>
        </form>

        {/* Existing List */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Current Materials</h4>
          {selectedCourse.materials.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No materials added yet.</p>
          ) : (
            selectedCourse.materials.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  {m.type === 'video' ? <PlayCircle size={18} className="text-red-400"/> : <FileText size={18} className="text-blue-400"/>}
                  <span className="text-sm font-medium">{m.title}</span>
                </div>
                <button onClick={() => removeMaterial(m.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

const AdminExamBuilder = ({ courses, setCourses }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id);
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  
  // Question Builder State
  const [currQ, setCurrQ] = useState({ 
    text: '', 
    type: 'mcq', // mcq, tf, essay
    options: ['Option A', 'Option B', 'Option C', 'Option D'], 
    correct: 0, // index for mcq, boolean for tf
    explanation: ''
  });

  const addQuestion = () => {
    setQuestions([...questions, { ...currQ, id: Date.now() }]);
    // Reset question builder slightly but keep structure
    setCurrQ({ ...currQ, text: '', explanation: '' }); 
  };

  const saveExam = () => {
    if (!examTitle || questions.length === 0) return;
    const newExam = {
      id: Date.now(),
      title: examTitle,
      questions: questions
    };
    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseId) {
        return { ...c, exams: [...c.exams, newExam] };
      }
      return c;
    });
    setCourses(updatedCourses);
    setExamTitle('');
    setQuestions([]);
    alert("Exam Published Successfully!");
  };

  return (
    <div className="grid md:grid-cols-12 gap-8">
      <div className="md:col-span-4 space-y-4">
        <GlassCard>
           <h3 className="text-lg font-bold mb-4">Exam Settings</h3>
           <div className="mb-4">
             <label className="text-xs text-slate-400 block mb-1">Target Subject</label>
             <select 
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
           </div>
           <div className="mb-4">
             <label className="text-xs text-slate-400 block mb-1">Exam Title</label>
             <input 
                type="text"
                placeholder="Mid-term Quiz"
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
           </div>
           <NeonButton onClick={saveExam} variant="success" className="w-full" disabled={questions.length === 0}>
             Publish Exam
           </NeonButton>
        </GlassCard>

        {/* Questions Preview List */}
        <div className="space-y-2">
          {questions.map((q, i) => (
             <div key={q.id} className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm">
               <div className="flex justify-between">
                 <span className="font-bold text-cyan-200">Q{i+1}: {q.type.toUpperCase()}</span>
                 <button onClick={() => setQuestions(questions.filter(qi => qi.id !== q.id))} className="text-red-400"><Trash2 size={14}/></button>
               </div>
               <p className="line-clamp-1 opacity-70">{q.text}</p>
             </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-8">
        <GlassCard>
          <h3 className="text-xl font-bold mb-6 text-cyan-300">Question Builder</h3>
          
          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase font-bold ml-1">Question Text</label>
            <textarea 
              value={currQ.text}
              onChange={e => setCurrQ({...currQ, text: e.target.value})}
              className="w-full bg-slate-900/50 border border-white/20 rounded-xl p-4 mt-2 h-24 text-white focus:border-cyan-500"
              placeholder="Enter the question here..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <select 
                value={currQ.type}
                onChange={e => setCurrQ({...currQ, type: e.target.value})}
                className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="tf">True / False</option>
                <option value="essay">Essay (Self-Eval)</option>
              </select>
            </div>
            
            {/* Logic based on type */}
            {currQ.type === 'mcq' && (
               <div>
                  <label className="text-xs text-slate-400 block mb-1">Correct Option Index (0-3)</label>
                  <input type="number" min="0" max="3" value={currQ.correct} onChange={e => setCurrQ({...currQ, correct: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2" />
               </div>
            )}
            {currQ.type === 'tf' && (
               <div>
                  <label className="text-xs text-slate-400 block mb-1">Correct Answer</label>
                  <select value={currQ.correct ? 'true' : 'false'} onChange={e => setCurrQ({...currQ, correct: e.target.value === 'true'})} className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2">
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
               </div>
            )}
          </div>

          {currQ.type === 'mcq' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {currQ.options.map((opt, i) => (
                <input 
                  key={i}
                  type="text" 
                  value={opt}
                  onChange={e => {
                    const newOpts = [...currQ.options];
                    newOpts[i] = e.target.value;
                    setCurrQ({...currQ, options: newOpts});
                  }}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2 ${currQ.correct === i ? 'border-green-500 text-green-300' : 'border-white/20'}`}
                  placeholder={`Option ${i+1}`}
                />
              ))}
            </div>
          )}

          <div className="mb-6">
             <label className="text-xs text-slate-400 block mb-1">Explanation (Shown after answer)</label>
             <input 
                type="text" 
                value={currQ.explanation}
                onChange={e => setCurrQ({...currQ, explanation: e.target.value})}
                className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2"
                placeholder="Why is this the correct answer?"
             />
          </div>

          <NeonButton onClick={addQuestion} className="w-full" disabled={!currQ.text}>
            <Plus size={18} /> Add Question
          </NeonButton>
        </GlassCard>
      </div>
    </div>
  );
};

// --- STUDENT VIEWERS ---

const CourseViewer = ({ course }) => {
  const [activeTab, setActiveTab] = useState('materials'); // materials, exams
  const [activeExam, setActiveExam] = useState(null); // exam object

  if (activeExam) {
    return <ExamRunner exam={activeExam} onExit={() => setActiveExam(null)} />;
  }

  return (
    <div>
      <div className="mb-8 p-6 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 rounded-3xl border border-white/10 backdrop-blur-md">
        <h2 className="text-4xl font-bold mb-2">{course.title}</h2>
        <p className="text-cyan-200/80 max-w-2xl">{course.description}</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('materials')}
          className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'materials' ? 'bg-white text-slate-900' : 'bg-white/5 hover:bg-white/10'}`}
        >
          Study Materials
        </button>
        <button 
          onClick={() => setActiveTab('exams')}
          className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'exams' ? 'bg-white text-slate-900' : 'bg-white/5 hover:bg-white/10'}`}
        >
          Exams & Quizzes
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'materials' ? (
          <motion.div 
            key="materials"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {course.materials.length === 0 && <div className="col-span-2 text-center py-12 text-slate-500">No materials available yet.</div>}
            
            {course.materials.map(mat => (
              <GlassCard key={mat.id} className="group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${mat.type === 'video' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {mat.type === 'video' ? <PlayCircle size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{mat.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 uppercase tracking-wide">{mat.type}</span>
                  </div>
                </div>
                
                {mat.type === 'video' ? (
                   // Simple YouTube Embed Logic
                   <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4 border border-white/10">
                     {/* Basic URL parsing - assumes standard youtube link, falls back to link button if fail */}
                     {mat.url.includes('youtube') || mat.url.includes('youtu.be') ? (
                       <iframe 
                         width="100%" 
                         height="100%" 
                         src={`https://www.youtube.com/embed/${mat.url.split('v=')[1]?.split('&')[0] || mat.url.split('/').pop()}`} 
                         title={mat.title}
                         frameBorder="0" 
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                       ></iframe>
                     ) : (
                       <div className="flex items-center justify-center h-full text-slate-500">Preview Unavailable</div>
                     )}
                   </div>
                ) : null}

                <a 
                  href={mat.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
                >
                  {mat.type === 'video' ? 'Watch on YouTube' : 'Download / View'} <ChevronRight size={16} />
                </a>
              </GlassCard>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="exams"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {course.exams.length === 0 && <div className="col-span-3 text-center py-12 text-slate-500">No exams available yet.</div>}
            
            {course.exams.map(exam => (
               <GlassCard key={exam.id} className="text-center py-8 hover:border-cyan-500/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    <Award size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                  <p className="text-slate-400 mb-6">{exam.questions.length} Questions</p>
                  <NeonButton onClick={() => setActiveExam(exam)} className="w-full">Start Exam</NeonButton>
               </GlassCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExamRunner = ({ exam, onExit }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { qId: answerValue }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const question = exam.questions[currentQIndex];

  const handleSelect = (val) => {
    if (submitted) return;
    setAnswers({ ...answers, [question.id]: val });
  };

  const calculateScore = () => {
    let s = 0;
    exam.questions.forEach(q => {
      const ans = answers[q.id];
      if (q.type === 'mcq') {
        if (ans === q.correct) s++;
      } else if (q.type === 'tf') {
        if (ans === q.correct) s++;
      } else {
        // Essay is auto-marked correct for prototype
        if (ans) s++;
      }
    });
    setScore(s);
    setSubmitted(true);
  };

  const getResultColor = (qId) => {
    if (!submitted) return "";
    const q = exam.questions.find(q => q.id === qId);
    const userAns = answers[qId];
    if (q.type === 'essay') return "border-yellow-500/50";
    if (userAns === q.correct) return "border-green-500 bg-green-500/10";
    return "border-red-500 bg-red-500/10";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">{exam.title}</h2>
        <button onClick={onExit} className="text-sm text-slate-400 hover:text-white underline">Exit Exam</button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {exam.questions.map((q, i) => (
          <div 
            key={q.id} 
            className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold border ${
              i === currentQIndex ? 'bg-cyan-500 border-cyan-300 text-white' : 
              submitted ? (getResultColor(q.id) || 'border-white/20') : 
              answers[q.id] !== undefined ? 'bg-white/20 border-white/40' : 'border-white/10 text-slate-500'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <GlassCard className="min-h-[400px] flex flex-col relative overflow-hidden">
        {submitted && (
           <div className="absolute top-0 right-0 p-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                question.type === 'mcq' && answers[question.id] === question.correct ? 'bg-green-500 text-black' :
                question.type === 'tf' && answers[question.id] === question.correct ? 'bg-green-500 text-black' :
                'bg-red-500 text-white'
              }`}>
                {question.type === 'essay' ? 'Self Check' : (answers[question.id] === question.correct ? 'Correct' : 'Incorrect')}
              </span>
           </div>
        )}

        <h3 className="text-xl font-medium mb-8 leading-relaxed">
           <span className="text-cyan-400 font-bold mr-2">Q{currentQIndex + 1}.</span> 
           {question.text}
        </h3>

        <div className="space-y-4 flex-1">
          {question.type === 'mcq' && question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                answers[question.id] === i 
                  ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : 'bg-slate-900/40 border-white/10 hover:bg-white/5'
              } ${submitted && question.correct === i ? '!bg-green-500/20 !border-green-500' : ''}`}
            >
              <span className="opacity-50 mr-3 text-sm uppercase">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}

          {question.type === 'tf' && (
             <div className="flex gap-4">
                {[true, false].map((val) => (
                   <button 
                     key={val.toString()}
                     onClick={() => handleSelect(val)}
                     disabled={submitted}
                     className={`flex-1 p-6 rounded-xl border font-bold text-lg transition-all ${
                       answers[question.id] === val
                       ? 'bg-cyan-500/20 border-cyan-500'
                       : 'bg-slate-900/40 border-white/10 hover:bg-white/5'
                     } ${submitted && question.correct === val ? '!bg-green-500/20 !border-green-500' : ''}`}
                   >
                     {val ? 'True' : 'False'}
                   </button>
                ))}
             </div>
          )}

          {question.type === 'essay' && (
             <textarea 
               value={answers[question.id] || ''} 
               onChange={e => handleSelect(e.target.value)}
               disabled={submitted}
               placeholder="Type your answer here..."
               className="w-full h-40 bg-slate-900/50 border border-white/10 rounded-xl p-4 resize-none focus:border-cyan-500 outline-none"
             />
          )}
        </div>

        {submitted && question.explanation && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg border-l-4 border-cyan-500 text-sm text-slate-300">
            <span className="block font-bold text-cyan-400 mb-1">Explanation:</span>
            {question.explanation}
          </div>
        )}

        <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
           <button 
             disabled={currentQIndex === 0}
             onClick={() => setCurrentQIndex(prev => prev - 1)}
             className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30"
           >
             Previous
           </button>

           {!submitted ? (
             currentQIndex === exam.questions.length - 1 ? (
               <NeonButton onClick={calculateScore} variant="success">Submit Exam</NeonButton>
             ) : (
               <NeonButton onClick={() => setCurrentQIndex(prev => prev + 1)}>Next Question</NeonButton>
             )
           ) : (
             <div className="flex gap-4 items-center">
               <span className="font-bold text-xl">Score: {score} / {exam.questions.length}</span>
               {currentQIndex < exam.questions.length - 1 && (
                 <NeonButton onClick={() => setCurrentQIndex(prev => prev + 1)}>Next</NeonButton>
               )}
             </div>
           )}
        </div>
      </GlassCard>
    </div>
  );
};