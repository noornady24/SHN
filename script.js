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
  materials: [], 
  exams: [] 
}));

const INITIAL_ADMIN = {
  id: 'admin-1',
  name: 'Noor Nady (Supervisor)',
  email: ADMIN_EMAIL,
  role: 'admin',
  status: 'approved'
};

// --- GLOBAL STATE MANAGEMENT ---

const state = {
    view: 'landing', // landing, login, signup, student-dash, admin-dash, course-view
    users: [],
    courses: [],
    currentUser: null,
    selectedCourseId: null,
    notification: null,
    
    // UI Local States (replaces useState in components)
    loginEmail: '',
    loginPass: '',
    signupForm: { name: '', email: '', password: '', mobile: '', grade: 'Year 1' },
    adminTab: 'requests',
    newMaterial: { type: 'video', title: '', url: '' },
    examBuilder: {
        title: '',
        questions: [],
        currQ: { 
            text: '', type: 'mcq', options: ['Option A', 'Option B', 'Option C', 'Option D'], 
            correct: 0, explanation: '' 
        }
    },
    courseViewTab: 'materials',
    activeExam: null,
    examRunner: {
        currentQIndex: 0,
        answers: {},
        submitted: false,
        score: 0
    }
};

// --- INITIALIZATION ---

function init() {
    const storedUsers = JSON.parse(localStorage.getItem('minia_users') || '[]');
    const storedCourses = JSON.parse(localStorage.getItem('minia_courses') || '[]');

    if (storedUsers.length === 0) {
        state.users = [INITIAL_ADMIN];
        localStorage.setItem('minia_users', JSON.stringify([INITIAL_ADMIN]));
    } else {
        state.users = storedUsers;
    }

    if (storedCourses.length === 0) {
        state.courses = INITIAL_SUBJECTS;
        localStorage.setItem('minia_courses', JSON.stringify(INITIAL_SUBJECTS));
    } else {
        state.courses = storedCourses;
    }

    render();
}

// --- PERSISTENCE & UTILS ---

function saveUsers(newUsers) {
    state.users = newUsers;
    localStorage.setItem('minia_users', JSON.stringify(newUsers));
    render();
}

function saveCourses(newCourses) {
    state.courses = newCourses;
    localStorage.setItem('minia_courses', JSON.stringify(newCourses));
    render();
}

function showNotification(msg, type = 'info') {
    state.notification = { msg, type };
    render();
    setTimeout(() => {
        state.notification = null;
        render(); // Re-render to remove notification
    }, 4000);
}

// --- ACTIONS ---

function setView(viewName) {
    state.view = viewName;
    // Reset temporary states
    state.loginEmail = '';
    state.loginPass = '';
    render();
}

function handleLogin(e) {
    e.preventDefault();
    const email = state.loginEmail;
    const password = state.loginPass;

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        state.currentUser = INITIAL_ADMIN;
        setView('admin-dash');
        return;
    }

    const user = state.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        if (user.role === 'admin') {
            state.currentUser = user;
            setView('admin-dash');
        } else {
            if (user.status === 'approved') {
                state.currentUser = user;
                setView('student-dash');
            } else {
                showNotification("Account Pending Approval from Supervisor.", "error");
            }
        }
    } else {
        showNotification("Invalid Credentials.", "error");
    }
}

function handleSignup(e) {
    e.preventDefault();
    const data = state.signupForm;

    if (state.users.some(u => u.email === data.email)) {
        showNotification("Email already registered.", "error");
        return;
    }
    const newUser = { ...data, id: Date.now().toString(), role: 'student', status: 'pending', progress: {} };
    saveUsers([...state.users, newUser]);
    showNotification("Registration successful! Waiting for approval.", "success");
    setView('landing');
}

function handleLogout() {
    state.currentUser = null;
    state.selectedCourseId = null;
    setView('landing');
}

// --- COMPONENTS (HTML GENERATORS) ---

function StarBackground() {
    // Generate static stars html
    let starsHtml = '';
    for(let i=0; i<50; i++) {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        
        starsHtml += `
            <div class="absolute bg-white rounded-full shadow-[0_0_5px_white] star-pulse"
                 style="top: ${top}%; left: ${left}%; width: ${size}px; height: ${size}px; animation-duration: ${duration}s; animation-delay: ${delay}s;">
            </div>
        `;
    }

    return `
    <div class="fixed inset-0 z-0 bg-slate-950 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.2),transparent_70%)]"></div>
        <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px]"></div>
        ${starsHtml}
    </div>`;
}

function NeonButton({ text, onClick, variant = "primary", type = "button", className = "", disabled = false }) {
    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] border border-cyan-400/30",
        secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40",
        danger: "bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        success: "bg-green-500/20 text-green-200 border border-green-500/50 hover:bg-green-500/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
    };

    return `<button type="${type}" onclick="${onClick}" ${disabled ? 'disabled' : ''} 
        class="px-6 py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}">
        ${text}
    </button>`;
}

function NotificationToast() {
    if (!state.notification) return '';
    const isError = state.notification.type === 'error';
    const icon = isError ? 'x-circle' : 'check-circle';
    const colorClass = isError ? 'bg-red-900/80 text-red-100' : 'bg-green-900/80 text-green-100';

    return `
    <div class="fade-in fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-3 ${colorClass}">
        <i data-lucide="${icon}" width="20"></i>
        <span class="font-medium">${state.notification.msg}</span>
    </div>`;
}

// --- VIEWS RENDERERS ---

function renderLanding() {
    return `
    <div class="min-h-screen text-white relative font-sans selection:bg-cyan-500/30">
        ${StarBackground()}
        <div class="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-center items-center">
          
          <div class="text-center mb-16 fade-in-up" style="animation-delay: 0s;">
            <div class="inline-block p-4 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-white/10 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <i data-lucide="atom" class="text-cyan-300 w-16 h-16"></i>
            </div>
            <h1 class="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-white to-purple-200 mb-4 tracking-tight">
              Minia University
            </h1>
            <h2 class="text-2xl md:text-3xl text-cyan-100/80 font-light">
              Faculty of Education • Mathematics Department
            </h2>
          </div>

          <div class="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            <div class="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group flex flex-col items-center text-center fade-in-up" style="animation-delay: 0.1s;">
              <div class="p-4 rounded-full bg-blue-500/20 mb-4 group-hover:bg-blue-500/30 transition-colors">
                <i data-lucide="user" class="text-blue-300 w-10 h-10"></i>
              </div>
              <h3 class="text-2xl font-bold mb-2">Student Portal</h3>
              <p class="text-slate-300 mb-6">Access courses, exams, and resources.</p>
              <div class="flex gap-4 w-full">
                ${NeonButton({text: "Login", variant: "secondary", className: "flex-1", onClick: "setView('login')"})}
                ${NeonButton({text: "Join Now", variant: "primary", className: "flex-1", onClick: "setView('signup')"})}
              </div>
            </div>

            <div class="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group flex flex-col items-center text-center fade-in-up" style="animation-delay: 0.2s;">
               <div class="p-4 rounded-full bg-purple-500/20 mb-4 group-hover:bg-purple-500/30 transition-colors">
                <i data-lucide="shield-check" class="text-purple-300 w-10 h-10"></i>
              </div>
              <h3 class="text-2xl font-bold mb-2">Supervisor Access</h3>
              <p class="text-slate-300 mb-6">Manage students, content, and analytics.</p>
              ${NeonButton({text: "Secure Login", variant: "secondary", className: "w-full", onClick: "setView('login-admin')"})}
            </div>
          </div>
        </div>
        ${NotificationToast()}
    </div>`;
}

function renderAuth(mode) { // mode: login, login-admin, signup
    const title = mode === 'signup' ? 'Student Registration' : mode === 'login-admin' ? 'Supervisor Login' : 'Student Login';
    const isSignup = mode === 'signup';
    const isAdmin = mode === 'login-admin';

    let formContent = '';
    if (isSignup) {
        formContent = `
        <form onsubmit="handleSignup(event)">
            <div class="mb-4">
                <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Full Name</label>
                <input type="text" placeholder="John Doe" required class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" value="${state.signupForm.name}" oninput="state.signupForm.name = this.value">
            </div>
            <div class="mb-4">
                <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Email Address</label>
                <input type="email" placeholder="student@minia.edu.eg" required class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" value="${state.signupForm.email}" oninput="state.signupForm.email = this.value">
            </div>
            <div class="mb-4">
                <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Mobile Number</label>
                <input type="tel" placeholder="01xxxxxxxxx" required class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" value="${state.signupForm.mobile}" oninput="state.signupForm.mobile = this.value">
            </div>
            <div class="mb-4">
                <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Password</label>
                <input type="password" placeholder="••••••••" required class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" value="${state.signupForm.password}" oninput="state.signupForm.password = this.value">
            </div>
            <div class="mb-6">
                <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Academic Year</label>
                <select onchange="state.signupForm.grade = this.value" class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50">
                    <option class="bg-slate-900" ${state.signupForm.grade === 'Year 1' ? 'selected' : ''}>Year 1</option>
                    <option class="bg-slate-900" ${state.signupForm.grade === 'Year 2' ? 'selected' : ''}>Year 2</option>
                    <option class="bg-slate-900" ${state.signupForm.grade === 'Year 3' ? 'selected' : ''}>Year 3</option>
                    <option class="bg-slate-900" ${state.signupForm.grade === 'Year 4' ? 'selected' : ''}>Year 4</option>
                </select>
            </div>
            ${NeonButton({text: "Register Account", type: "submit", className: "w-full mb-4"})}
        </form>
        <div class="text-center text-sm text-slate-400">
            Already have an account? <button type="button" onclick="setView('login')" class="text-cyan-400 hover:text-cyan-300 underline">Login</button>
        </div>`;
    } else {
        formContent = `
        <form onsubmit="handleLogin(event)">
            <div class="mb-4">
                <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Email</label>
                <input type="email" placeholder="email@address.com" required class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" value="${state.loginEmail}" oninput="state.loginEmail = this.value">
            </div>
            <div class="mb-4">
                <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Password</label>
                <input type="password" placeholder="••••••••" required class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" value="${state.loginPass}" oninput="state.loginPass = this.value">
            </div>
            ${NeonButton({text: isAdmin ? 'Verify & Access' : 'Login', type: "submit", className: "w-full mb-4"})}
        </form>
        ${!isAdmin ? `<div class="text-center text-sm text-slate-400">
          New Student? <button type="button" onclick="setView('signup')" class="text-cyan-400 hover:text-cyan-300 underline">Register</button>
        </div>` : ''}
        `;
    }

    return `
    <div class="min-h-screen text-white relative flex items-center justify-center p-4">
        ${StarBackground()}
        <div class="glass-card w-full max-w-md relative z-10 rounded-2xl p-6 fade-in-up">
          <button onclick="setView('landing')" class="absolute top-4 right-4 text-slate-400 hover:text-white">
            <i data-lucide="x-circle"></i>
          </button>
          
          <h2 class="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            ${title}
          </h2>
          ${formContent}
        </div>
        ${NotificationToast()}
    </div>`;
}

function renderDashboardLayout(content, showBack = false) {
    const userRole = state.currentUser.role === 'admin' ? 'Supervisor' : state.currentUser.grade;
    const backBtn = showBack ? `<button onclick="setView('student-dash')" class="p-2 rounded-lg hover:bg-white/10 transition-colors"><i data-lucide="chevron-left"></i></button>` : '';

    return `
    <div class="min-h-screen text-white relative font-sans">
        ${StarBackground()}
        <div class="relative z-10 flex flex-col h-screen">
          <header class="h-20 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 shrink-0">
            <div class="flex items-center gap-4">
              ${backBtn}
              <div class="flex items-center gap-3">
                <div class="bg-gradient-to-tr from-cyan-500 to-blue-500 p-2 rounded-lg">
                  <i data-lucide="atom" class="text-white w-6 h-6"></i>
                </div>
                <div class="hidden md:block">
                  <h1 class="font-bold text-lg leading-tight">Minia University</h1>
                  <p class="text-xs text-cyan-200/70">Mathematics Department</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-right hidden md:block">
                <div class="font-bold text-sm">${state.currentUser.name}</div>
                <div class="text-xs text-cyan-400 uppercase tracking-wider">${userRole}</div>
              </div>
              <button onclick="handleLogout()" class="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
                <i data-lucide="log-out" width="20"></i>
              </button>
            </div>
          </header>

          <main class="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-thin">
            <div class="container mx-auto max-w-7xl">
              ${content}
            </div>
          </main>
        </div>
        ${NotificationToast()}
    </div>
    `;
}

function renderStudentDash() {
    const coursesHtml = state.courses.map((course, idx) => `
        <div class="glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer h-full flex flex-col justify-between fade-in-up" 
             style="animation-delay: ${idx * 0.05}s">
            <div onclick="state.selectedCourseId = '${course.id}'; setView('course-view');">
                <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                    <i data-lucide="book-open" class="text-cyan-300 w-6 h-6"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2 line-clamp-1">${course.title}</h3>
                <p class="text-sm text-slate-400 mb-4 line-clamp-2">${course.description}</p>
            </div>
            <div class="flex justify-between items-center text-xs text-slate-500 border-t border-white/5 pt-4">
                <span class="flex items-center gap-1"><i data-lucide="file-text" width="12"></i> ${course.materials.length} Resources</span>
                <span class="flex items-center gap-1"><i data-lucide="award" width="12"></i> ${course.exams.length} Exams</span>
            </div>
        </div>
    `).join('');

    const content = `
        <div class="space-y-8">
          <div class="flex justify-between items-end">
            <div>
              <h2 class="text-3xl font-bold text-white mb-2">My Courses</h2>
              <p class="text-cyan-200/60">Select a subject to start learning.</p>
            </div>
            <div class="hidden md:block">
               <span class="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                 Academic Year: ${state.currentUser.grade}
               </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${coursesHtml}
          </div>
        </div>
    `;
    return renderDashboardLayout(content);
}

// --- ADMIN PANELS ---

function adminApproveUser(id) {
    const newUsers = state.users.map(u => u.id === id ? { ...u, status: 'approved' } : u);
    saveUsers(newUsers);
}

function adminDeleteUser(id) {
    const newUsers = state.users.filter(u => u.id !== id);
    saveUsers(newUsers);
}

function renderAdminDash() {
    const pendingUsers = state.users.filter(u => u.status === 'pending');
    const allStudents = state.users.filter(u => u.role === 'student');

    // Tab Navigation
    const tabs = [
        { id: 'requests', icon: 'user', label: 'Requests', count: pendingUsers.length },
        { id: 'courses', icon: 'book-open', label: 'Courses' },
        { id: 'exams', icon: 'file-text', label: 'Exam Builder' },
        { id: 'stats', icon: 'bar-chart', label: 'Analytics' }
    ];

    const tabsHtml = tabs.map(t => `
        <button onclick="state.adminTab = '${t.id}'; render();" 
            class="flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${state.adminTab === t.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
            <i data-lucide="${t.icon}" width="18"></i>
            ${t.label}
            ${t.count > 0 ? `<span class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">${t.count}</span>` : ''}
        </button>
    `).join('');

    let tabContent = '';

    if (state.adminTab === 'requests') {
        const requestsHtml = pendingUsers.length === 0 
            ? `<div class="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">No pending requests</div>`
            : pendingUsers.map(user => `
                <div class="glass-card rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-4">
                  <div class="flex items-center gap-4">
                    <div class="bg-orange-500/20 p-3 rounded-full text-orange-300">
                      <i data-lucide="clock" width="24"></i>
                    </div>
                    <div>
                      <h4 class="font-bold text-lg">${user.name}</h4>
                      <p class="text-sm text-slate-400">${user.email} • ${user.grade}</p>
                      <p class="text-xs text-slate-500">Mobile: ${user.mobile}</p>
                    </div>
                  </div>
                  <div class="flex gap-2 w-full md:w-auto">
                    ${NeonButton({text: "Approve", variant: "success", onClick: `adminApproveUser('${user.id}')`, className: "flex-1 md:flex-none"})}
                    ${NeonButton({text: "Reject", variant: "danger", onClick: `adminDeleteUser('${user.id}')`, className: "flex-1 md:flex-none"})}
                  </div>
                </div>
            `).join('');

        const studentRows = allStudents.map(s => `
            <tr class="hover:bg-white/5">
                <td class="p-4 font-medium text-white">${s.name}</td>
                <td class="p-4">${s.grade}</td>
                <td class="p-4">${s.email}</td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded text-xs ${s.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}">
                    ${s.status}
                  </span>
                </td>
            </tr>
        `).join('');

        tabContent = `
            <div class="space-y-6 fade-in">
              <h3 class="text-xl font-semibold text-cyan-200">Pending Approvals (${pendingUsers.length})</h3>
              <div class="grid gap-4">${requestsHtml}</div>

              <h3 class="text-xl font-semibold text-cyan-200 mt-12">All Students (${allStudents.length})</h3>
               <div class="overflow-x-auto rounded-xl border border-white/10">
                <table class="w-full text-left text-sm text-slate-400">
                  <thead class="bg-white/5 text-white">
                    <tr><th class="p-4">Name</th><th class="p-4">Grade</th><th class="p-4">Email</th><th class="p-4">Status</th></tr>
                  </thead>
                  <tbody class="divide-y divide-white/5">${studentRows}</tbody>
                </table>
              </div>
            </div>
        `;
    } else if (state.adminTab === 'courses') {
        tabContent = renderAdminCourses();
    } else if (state.adminTab === 'exams') {
        tabContent = renderAdminExams();
    } else if (state.adminTab === 'stats') {
        tabContent = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
              <div class="glass-card rounded-2xl text-center py-12">
                <div class="text-5xl font-bold text-cyan-300 mb-2">${allStudents.length}</div>
                <div class="text-slate-400">Total Students</div>
              </div>
              <div class="glass-card rounded-2xl text-center py-12">
                <div class="text-5xl font-bold text-purple-300 mb-2">${state.courses.length}</div>
                <div class="text-slate-400">Active Subjects</div>
              </div>
              <div class="glass-card rounded-2xl text-center py-12">
                <div class="text-5xl font-bold text-green-300 mb-2">
                  ${state.courses.reduce((acc, c) => acc + c.exams.length, 0)}
                </div>
                <div class="text-slate-400">Exams Created</div>
              </div>
            </div>
        `;
    }

    const content = `
        <div>
            <h2 class="text-3xl font-bold mb-8">Supervisor Dashboard</h2>
            <div class="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">${tabsHtml}</div>
            ${tabContent}
        </div>
    `;

    return renderDashboardLayout(content);
}

// Admin Course Manager Logic
function adminAddMaterial(e) {
    e.preventDefault();
    const courseId = state.selectedCourseId || state.courses[0].id;
    const newMat = { ...state.newMaterial, id: Date.now() };
    
    const updatedCourses = state.courses.map(c => {
        if (c.id === courseId) {
            return { ...c, materials: [...c.materials, newMat] };
        }
        return c;
    });
    
    // Reset form
    state.newMaterial = { type: 'video', title: '', url: '' };
    saveCourses(updatedCourses);
}

function adminRemoveMaterial(matId) {
    const courseId = state.selectedCourseId || state.courses[0].id;
    const updatedCourses = state.courses.map(c => {
        if (c.id === courseId) {
            return { ...c, materials: c.materials.filter(m => m.id !== matId) };
        }
        return c;
    });
    saveCourses(updatedCourses);
}

function renderAdminCourses() {
    const selectedId = state.selectedCourseId || state.courses[0].id;
    // ensure selectedId is set for next renders
    if(!state.selectedCourseId) state.selectedCourseId = selectedId;

    const selectedCourse = state.courses.find(c => c.id === selectedId);

    const sidebar = state.courses.map(c => `
        <div onclick="state.selectedCourseId = '${c.id}'; render();"
            class="p-4 rounded-xl cursor-pointer border transition-all mb-2 ${selectedId === c.id ? 'bg-cyan-500/20 border-cyan-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}">
            <h4 class="font-semibold">${c.title}</h4>
            <div class="text-xs opacity-70 mt-1">${c.materials.length} Materials</div>
        </div>
    `).join('');

    const currentMaterials = selectedCourse.materials.length === 0 
        ? `<p class="text-slate-500 text-sm italic">No materials added yet.</p>` 
        : selectedCourse.materials.map(m => `
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 mb-2">
                <div class="flex items-center gap-3">
                  <i data-lucide="${m.type === 'video' ? 'play-circle' : 'file-text'}" class="${m.type === 'video' ? 'text-red-400' : 'text-blue-400'}" width="18"></i>
                  <span class="text-sm font-medium">${m.title}</span>
                </div>
                <button onclick="adminRemoveMaterial(${m.id})" class="text-slate-500 hover:text-red-400 transition-colors">
                  <i data-lucide="trash-2" width="16"></i>
                </button>
            </div>
        `).join('');

    return `
    <div class="grid md:grid-cols-3 gap-8 fade-in">
        <div class="md:col-span-1 max-h-[600px] overflow-y-auto pr-2">
            ${sidebar}
        </div>
        <div class="glass-card rounded-2xl p-6 md:col-span-2">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-2">
              <span class="text-cyan-400">Editing:</span> ${selectedCourse.title}
            </h3>

            <form onsubmit="adminAddMaterial(event)" class="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
              <h4 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Add Learning Content</h4>
              <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs mb-1 ml-1 text-slate-400">Content Type</label>
                  <select onchange="state.newMaterial.type = this.value" class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white">
                    <option value="video" ${state.newMaterial.type === 'video' ? 'selected' : ''}>YouTube Video</option>
                    <option value="link" ${state.newMaterial.type === 'link' ? 'selected' : ''}>Link</option>
                    <option value="file" ${state.newMaterial.type === 'file' ? 'selected' : ''}>File Download</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs mb-1 ml-1 text-slate-400">Title</label>
                  <input type="text" placeholder="e.g. Lecture 1" required class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white" value="${state.newMaterial.title}" oninput="state.newMaterial.title = this.value">
                </div>
              </div>
              <div class="mb-4">
                 <label class="block text-xs mb-1 ml-1 text-slate-400">URL / Link</label>
                 <input type="url" placeholder="https://..." required class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white" value="${state.newMaterial.url}" oninput="state.newMaterial.url = this.value">
              </div>
              ${NeonButton({text: "Add to Course", type: "submit", className: "w-full"})}
            </form>

            <div class="space-y-3">
              <h4 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Current Materials</h4>
              ${currentMaterials}
            </div>
        </div>
    </div>`;
}

// Admin Exam Builder Logic
function adminAddQuestion() {
    const q = state.examBuilder.currQ;
    if(!q.text) return;
    state.examBuilder.questions.push({ ...q, id: Date.now() });
    state.examBuilder.currQ = { text: '', type: 'mcq', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0, explanation: '' };
    render();
}

function adminRemoveQuestion(id) {
    state.examBuilder.questions = state.examBuilder.questions.filter(q => q.id !== id);
    render();
}

function adminSaveExam() {
    if (!state.examBuilder.title || state.examBuilder.questions.length === 0) return;
    
    const courseId = state.selectedCourseId || state.courses[0].id;
    const newExam = {
      id: Date.now(),
      title: state.examBuilder.title,
      questions: state.examBuilder.questions
    };

    const updatedCourses = state.courses.map(c => {
      if (c.id === courseId) {
        return { ...c, exams: [...c.exams, newExam] };
      }
      return c;
    });

    saveCourses(updatedCourses);
    state.examBuilder = { title: '', questions: [], currQ: { text: '', type: 'mcq', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0, explanation: '' } };
    alert("Exam Published Successfully!");
}

function renderAdminExams() {
    const selectedId = state.selectedCourseId || state.courses[0].id;
    if(!state.selectedCourseId) state.selectedCourseId = selectedId;

    const questionsPreview = state.examBuilder.questions.map((q, i) => `
         <div class="p-3 bg-white/5 rounded-lg border border-white/10 text-sm mb-2">
           <div class="flex justify-between">
             <span class="font-bold text-cyan-200">Q${i+1}: ${q.type.toUpperCase()}</span>
             <button onclick="adminRemoveQuestion(${q.id})" class="text-red-400"><i data-lucide="trash-2" width="14"></i></button>
           </div>
           <p class="line-clamp-1 opacity-70">${q.text}</p>
         </div>
    `).join('');

    const currQ = state.examBuilder.currQ;

    // Option inputs for MCQ
    let optionsHtml = '';
    if (currQ.type === 'mcq') {
        optionsHtml = `<div class="grid grid-cols-2 gap-4 mb-6">` + 
        currQ.options.map((opt, i) => `
            <input type="text" value="${opt}" 
                oninput="const opts = state.examBuilder.currQ.options; opts[${i}] = this.value; render();"
                class="w-full bg-slate-900 border rounded-lg px-3 py-2 ${currQ.correct === i ? 'border-green-500 text-green-300' : 'border-white/20'}"
                placeholder="Option ${i+1}">
        `).join('') + `</div>`;
    }

    return `
    <div class="grid md:grid-cols-12 gap-8 fade-in">
      <div class="md:col-span-4 space-y-4">
        <div class="glass-card rounded-2xl p-6">
           <h3 class="text-lg font-bold mb-4">Exam Settings</h3>
           <div class="mb-4">
             <label class="text-xs text-slate-400 block mb-1">Target Subject</label>
             <select onchange="state.selectedCourseId = this.value; render();" class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white">
                ${state.courses.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.title}</option>`).join('')}
              </select>
           </div>
           <div class="mb-4">
             <label class="text-xs text-slate-400 block mb-1">Exam Title</label>
             <input type="text" placeholder="Mid-term Quiz" value="${state.examBuilder.title}" oninput="state.examBuilder.title = this.value"
                class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white">
           </div>
           ${NeonButton({text: "Publish Exam", variant: "success", className: "w-full", onClick: "adminSaveExam()", disabled: state.examBuilder.questions.length === 0})}
        </div>
        <div>${questionsPreview}</div>
      </div>

      <div class="md:col-span-8">
        <div class="glass-card rounded-2xl p-6">
          <h3 class="text-xl font-bold mb-6 text-cyan-300">Question Builder</h3>
          
          <div class="mb-4">
            <label class="text-xs text-slate-400 uppercase font-bold ml-1">Question Text</label>
            <textarea oninput="state.examBuilder.currQ.text = this.value"
              class="w-full bg-slate-900/50 border border-white/20 rounded-xl p-4 mt-2 h-24 text-white focus:border-cyan-500"
              placeholder="Enter the question here...">${currQ.text}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="text-xs text-slate-400 block mb-1">Type</label>
              <select onchange="state.examBuilder.currQ.type = this.value; render();" class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2">
                <option value="mcq" ${currQ.type === 'mcq' ? 'selected' : ''}>Multiple Choice</option>
                <option value="tf" ${currQ.type === 'tf' ? 'selected' : ''}>True / False</option>
                <option value="essay" ${currQ.type === 'essay' ? 'selected' : ''}>Essay</option>
              </select>
            </div>
            
            ${currQ.type === 'mcq' ? `
               <div>
                  <label class="text-xs text-slate-400 block mb-1">Correct Option Index (0-3)</label>
                  <input type="number" min="0" max="3" value="${currQ.correct}" oninput="state.examBuilder.currQ.correct = parseInt(this.value)" class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2" />
               </div>
            ` : ''}
            
            ${currQ.type === 'tf' ? `
               <div>
                  <label class="text-xs text-slate-400 block mb-1">Correct Answer</label>
                  <select onchange="state.examBuilder.currQ.correct = (this.value === 'true')" class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2">
                    <option value="true" ${currQ.correct ? 'selected' : ''}>True</option>
                    <option value="false" ${!currQ.correct ? 'selected' : ''}>False</option>
                  </select>
               </div>
            ` : ''}
          </div>

          ${optionsHtml}

          <div class="mb-6">
             <label class="text-xs text-slate-400 block mb-1">Explanation</label>
             <input type="text" value="${currQ.explanation}" oninput="state.examBuilder.currQ.explanation = this.value"
                class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2"
                placeholder="Why is this the correct answer?">
          </div>

          ${NeonButton({text: `<i data-lucide="plus" width="18"></i> Add Question`, className: "w-full", onClick: "adminAddQuestion()", disabled: !currQ.text})}
        </div>
      </div>
    </div>`;
}

// --- STUDENT COURSE VIEW ---

function renderCourseView() {
    const course = state.courses.find(c => c.id === state.selectedCourseId);
    if (!course) return renderStudentDash(); // Fallback

    if (state.activeExam) {
        return renderDashboardLayout(renderExamRunner(), true);
    }

    const tabBtnClass = (active) => `px-8 py-3 rounded-full font-bold transition-all ${active ? 'bg-white text-slate-900' : 'bg-white/5 hover:bg-white/10'}`;

    let contentHtml = '';
    
    if (state.courseViewTab === 'materials') {
        const matHtml = course.materials.length === 0 ? `<div class="col-span-2 text-center py-12 text-slate-500">No materials available yet.</div>` :
        course.materials.map(mat => {
            let embedHtml = '';
            if (mat.type === 'video') {
                const vidId = mat.url.split('v=')[1]?.split('&')[0] || mat.url.split('/').pop();
                embedHtml = (mat.url.includes('youtube') || mat.url.includes('youtu.be')) 
                ? `<div class="relative aspect-video rounded-lg overflow-hidden bg-black mb-4 border border-white/10">
                     <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${vidId}" title="${mat.title}" frameborder="0" allowfullscreen></iframe>
                   </div>` 
                : `<div class="flex items-center justify-center h-32 bg-black/50 mb-4 rounded border border-white/10 text-slate-500">Preview Unavailable</div>`;
            }
            return `
            <div class="glass-card rounded-2xl p-6">
                <div class="flex items-start gap-4 mb-4">
                  <div class="p-3 rounded-lg ${mat.type === 'video' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}">
                    <i data-lucide="${mat.type === 'video' ? 'play-circle' : 'file-text'}" width="24"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-lg mb-1">${mat.title}</h4>
                    <span class="text-xs px-2 py-0.5 rounded bg-white/10 uppercase tracking-wide">${mat.type}</span>
                  </div>
                </div>
                ${embedHtml}
                <a href="${mat.url}" target="_blank" class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-300 transition-all">
                  ${mat.type === 'video' ? 'Watch on YouTube' : 'Download / View'} <i data-lucide="chevron-right" width="16"></i>
                </a>
            </div>`;
        }).join('');
        contentHtml = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">${matHtml}</div>`;
    } else {
        const examHtml = course.exams.length === 0 ? `<div class="col-span-3 text-center py-12 text-slate-500">No exams available yet.</div>` :
        course.exams.map(exam => `
            <div class="glass-card rounded-2xl text-center py-8 hover:border-cyan-500/50 transition-colors p-6">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    <i data-lucide="award" class="text-white w-8 h-8"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">${exam.title}</h3>
                <p class="text-slate-400 mb-6">${exam.questions.length} Questions</p>
                ${NeonButton({text: "Start Exam", className: "w-full", onClick: `startExam(${exam.id})`})}
            </div>
        `).join('');
        contentHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">${examHtml}</div>`;
    }

    const main = `
        <div>
          <div class="mb-8 p-6 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 rounded-3xl border border-white/10 backdrop-blur-md">
            <h2 class="text-4xl font-bold mb-2">${course.title}</h2>
            <p class="text-cyan-200/80 max-w-2xl">${course.description}</p>
          </div>

          <div class="flex gap-4 mb-8">
            <button onclick="state.courseViewTab = 'materials'; render();" class="${tabBtnClass(state.courseViewTab === 'materials')}">Study Materials</button>
            <button onclick="state.courseViewTab = 'exams'; render();" class="${tabBtnClass(state.courseViewTab === 'exams')}">Exams & Quizzes</button>
          </div>
          
          ${contentHtml}
        </div>
    `;

    return renderDashboardLayout(main, true);
}

// --- EXAM RUNNER ---

function startExam(examId) {
    const course = state.courses.find(c => c.id === state.selectedCourseId);
    state.activeExam = course.exams.find(e => e.id === examId);
    state.examRunner = { currentQIndex: 0, answers: {}, submitted: false, score: 0 };
    render();
}

function handleExamAnswer(val) {
    if (state.examRunner.submitted) return;
    const qId = state.activeExam.questions[state.examRunner.currentQIndex].id;
    state.examRunner.answers[qId] = val;
    render();
}

function submitExam() {
    let s = 0;
    state.activeExam.questions.forEach(q => {
        const ans = state.examRunner.answers[q.id];
        if (q.type === 'mcq' || q.type === 'tf') {
            if (ans === q.correct) s++;
        } else {
            if (ans) s++; // Essay auto-credit
        }
    });
    state.examRunner.score = s;
    state.examRunner.submitted = true;
    render();
}

function renderExamRunner() {
    const { activeExam: exam, examRunner } = state;
    const { currentQIndex, answers, submitted, score } = examRunner;
    const question = exam.questions[currentQIndex];

    const getResultColor = (qId) => {
        if (!submitted) return "";
        const q = exam.questions.find(qi => qi.id === qId);
        const userAns = answers[qId];
        if (q.type === 'essay') return "border-yellow-500/50";
        if (userAns === q.correct) return "border-green-500 bg-green-500/10";
        return "border-red-500 bg-red-500/10";
    };

    const navDots = exam.questions.map((q, i) => `
        <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold border ${
            i === currentQIndex ? 'bg-cyan-500 border-cyan-300 text-white' : 
            submitted ? (getResultColor(q.id) || 'border-white/20') : 
            answers[q.id] !== undefined ? 'bg-white/20 border-white/40' : 'border-white/10 text-slate-500'
        }">${i + 1}</div>
    `).join('');

    let answerArea = '';
    
    if (question.type === 'mcq') {
        answerArea = question.options.map((opt, i) => `
            <button onclick="handleExamAnswer(${i})" ${submitted ? 'disabled' : ''}
              class="w-full text-left p-4 rounded-xl border transition-all mb-2 ${
                answers[question.id] === i 
                  ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : 'bg-slate-900/40 border-white/10 hover:bg-white/5'
              } ${submitted && question.correct === i ? '!bg-green-500/20 !border-green-500' : ''}">
              <span class="opacity-50 mr-3 text-sm uppercase">${String.fromCharCode(65 + i)}</span> ${opt}
            </button>
        `).join('');
    } else if (question.type === 'tf') {
        answerArea = `<div class="flex gap-4">
            ${[true, false].map(val => `
               <button onclick="handleExamAnswer(${val})" ${submitted ? 'disabled' : ''}
                 class="flex-1 p-6 rounded-xl border font-bold text-lg transition-all ${
                   answers[question.id] === val ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-900/40 border-white/10 hover:bg-white/5'
                 } ${submitted && question.correct === val ? '!bg-green-500/20 !border-green-500' : ''}">
                 ${val ? 'True' : 'False'}
               </button>
            `).join('')}
        </div>`;
    } else {
        answerArea = `<textarea oninput="handleExamAnswer(this.value)" ${submitted ? 'disabled' : ''}
            placeholder="Type your answer here..."
            class="w-full h-40 bg-slate-900/50 border border-white/10 rounded-xl p-4 resize-none focus:border-cyan-500 outline-none">${answers[question.id] || ''}</textarea>`;
    }

    const badge = submitted ? `<div class="absolute top-0 right-0 p-4">
        <span class="px-3 py-1 rounded-full text-xs font-bold ${
            (question.type === 'mcq' || question.type === 'tf') && answers[question.id] === question.correct ? 'bg-green-500 text-black' : 
            question.type === 'essay' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
        }">
            ${question.type === 'essay' ? 'Self Check' : (answers[question.id] === question.correct ? 'Correct' : 'Incorrect')}
        </span>
    </div>` : '';

    const explanation = (submitted && question.explanation) ? `
        <div class="mt-6 p-4 bg-white/5 rounded-lg border-l-4 border-cyan-500 text-sm text-slate-300">
            <span class="block font-bold text-cyan-400 mb-1">Explanation:</span> ${question.explanation}
        </div>` : '';

    const controls = `
        <div class="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
           <button onclick="state.examRunner.currentQIndex-- ; render()" ${currentQIndex === 0 ? 'disabled class="opacity-30"' : ''} class="px-4 py-2 text-slate-400 hover:text-white">Previous</button>

           ${!submitted ? (
             currentQIndex === exam.questions.length - 1 ? NeonButton({text: "Submit Exam", variant: "success", onClick: "submitExam()"}) 
             : NeonButton({text: "Next Question", onClick: "state.examRunner.currentQIndex++ ; render()"})
           ) : (
             `<div class="flex gap-4 items-center">
               <span class="font-bold text-xl">Score: ${score} / ${exam.questions.length}</span>
               ${currentQIndex < exam.questions.length - 1 ? NeonButton({text: "Next", onClick: "state.examRunner.currentQIndex++ ; render()"}) : ''}
             </div>`
           )}
        </div>
    `;

    return `
    <div class="max-w-3xl mx-auto fade-in">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold">${exam.title}</h2>
        <button onclick="state.activeExam = null; render();" class="text-sm text-slate-400 hover:text-white underline">Exit Exam</button>
      </div>

      <div class="mb-6 flex gap-2 overflow-x-auto pb-2">${navDots}</div>

      <div class="glass-card rounded-2xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
        ${badge}
        <h3 class="text-xl font-medium mb-8 leading-relaxed">
           <span class="text-cyan-400 font-bold mr-2">Q${currentQIndex + 1}.</span> ${question.text}
        </h3>
        <div class="space-y-4 flex-1">${answerArea}</div>
        ${explanation}
        ${controls}
      </div>
    </div>`;
}

// --- MAIN RENDER FUNCTION ---

function render() {
    const root = document.getElementById('root');
    let html = '';

    switch(state.view) {
        case 'landing': html = renderLanding(); break;
        case 'login': html = renderAuth('login'); break;
        case 'login-admin': html = renderAuth('login-admin'); break;
        case 'signup': html = renderAuth('signup'); break;
        case 'student-dash': html = renderStudentDash(); break;
        case 'admin-dash': html = renderAdminDash(); break;
        case 'course-view': html = renderCourseView(); break;
        default: html = renderLanding();
    }

    root.innerHTML = html;
    
    // Initialize Lucide icons
    if(window.lucide) {
        lucide.createIcons();
    }
}

// Start the app
init();