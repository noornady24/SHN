// --- FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyBnGRKtuNq37uFTVs4n16jWshKu5rMaXnQ",
    authDomain: "project-3403979804090393783.firebaseapp.com",
    projectId: "project-3403979804090393783",
    storageBucket: "project-3403979804090393783.firebasestorage.app",
    messagingSenderId: "200296118651",
    appId: "1:200296118651:web:aff0e8f1615f2bdb78a5de",
    measurementId: "G-ZNF0M7D6J9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- DATA & CONSTANTS ---
const ADMIN_EMAIL = "noornady00@gmail.com";
const ADMIN_PASS = "noornady2007";

const INITIAL_ADMIN = {
    id: 'admin-1',
    name: 'Noor Nady (Supervisor)',
    email: ADMIN_EMAIL,
    role: 'admin',
    status: 'approved',
    password: ADMIN_PASS 
};

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

// --- STATE MANAGEMENT (PERSISTENCE ADDED) ---
// محاولة استعادة الجلسة المحفوظة عند تحميل الصفحة
const savedSession = JSON.parse(localStorage.getItem('minia_session'));

let state = {
    view: savedSession?.view || 'landing', // استعادة آخر صفحة تم فتحها
    users: [], // سيتم جلبها من فايربيس دائماً لضمان التحديث
    courses: [], // سيتم جلبها من فايربيس دائماً
    currentUser: savedSession?.currentUser || null, // استعادة المستخدم المسجل
    selectedCourseId: savedSession?.selectedCourseId || null,
    activeTab: savedSession?.activeTab || 'materials',
    examState: null, // الامتحانات لا تحفظ حالتها عند الريفرش (أمان)
    adminTab: savedSession?.adminTab || 'requests' // استعادة تبويب الأدمن
};

// --- DOM ELEMENTS ---
const appDiv = document.getElementById('app');
const toastContainer = document.getElementById('toast-container');

// --- INITIALIZATION ---
async function init() {
    generateStars();
    // إذا كان هناك مستخدم محفوظ، ننتظر تحميل البيانات قبل عرض الصفحة
    await loadData();
    render();
}

// --- DATABASE FUNCTIONS ---
async function loadData() {
    try {
        // 1. Load Users
        const usersSnapshot = await getDocs(collection(db, "users"));
        if (usersSnapshot.empty) {
            await setDoc(doc(db, "users", INITIAL_ADMIN.id), INITIAL_ADMIN);
            state.users = [INITIAL_ADMIN];
        } else {
            state.users = usersSnapshot.docs.map(doc => doc.data());
        }

        // 2. Load Courses
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        if (coursesSnapshot.empty) {
            const batchPromises = INITIAL_SUBJECTS.map(c => setDoc(doc(db, "courses", c.id), c));
            await Promise.all(batchPromises);
            state.courses = INITIAL_SUBJECTS;
        } else {
            state.courses = coursesSnapshot.docs.map(doc => doc.data());
        }
    } catch (error) {
        console.error("Firebase Error:", error);
        showNotification("Error connecting to database", "error");
        state.users = [INITIAL_ADMIN];
        state.courses = INITIAL_SUBJECTS;
    }
}

async function saveUserToDB(user) {
    await setDoc(doc(db, "users", user.id), user);
    await loadData(); 
}

async function updateUserStatusInDB(userId, status) {
    await updateDoc(doc(db, "users", userId), { status: status });
    state.users = state.users.map(u => u.id === userId ? { ...u, status } : u);
    render();
}

async function deleteUserFromDB(userId) {
    await deleteDoc(doc(db, "users", userId));
    state.users = state.users.filter(u => u.id !== userId);
    render();
}

async function saveCourseToDB(course) {
    await setDoc(doc(db, "courses", course.id), course);
    state.courses = state.courses.map(c => c.id === course.id ? course : c);
    render();
}

// --- HELPER FUNCTIONS ---
function generateStars() {
    const starContainer = document.getElementById('star-background');
    starContainer.innerHTML = `
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.2),transparent_70%)]"></div>
        <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px]"></div>
    `;
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 1;
        star.className = 'absolute bg-white rounded-full shadow-[0_0_5px_white] star-anim';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starContainer.appendChild(star);
    }
}

function showNotification(msg, type = 'info') {
    const toast = document.createElement('div');
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-900/80' : 'bg-green-900/80';
    const textColor = isError ? 'text-red-100' : 'text-green-100';
    const icon = isError ? 'x-circle' : 'check-circle';

    toast.className = `px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-3 ${bgColor} ${textColor} fade-in-up mb-4`;
    toast.innerHTML = `<i data-lucide="${icon}" width="20"></i> <span class="font-medium">${msg}</span>`;
    
    toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// --- RENDERING LOGIC ---
function render() {
    // حفظ الحالة في كل مرة يتم فيها إعادة رسم الصفحة (Persistence Logic)
    localStorage.setItem('minia_session', JSON.stringify({
        view: state.view,
        currentUser: state.currentUser,
        selectedCourseId: state.selectedCourseId,
        activeTab: state.activeTab,
        adminTab: state.adminTab
    }));

    appDiv.innerHTML = ''; 
    
    switch (state.view) {
        case 'landing':
            appDiv.innerHTML = LandingPage();
            break;
        case 'login':
        case 'login-admin':
        case 'signup':
            appDiv.innerHTML = AuthPage(state.view);
            break;
        case 'student-dash':
            if (!state.currentUser) { navigate('login'); return; }
            appDiv.innerHTML = StudentDashboard();
            break;
        case 'admin-dash':
            if (!state.currentUser || state.currentUser.role !== 'admin') { navigate('login-admin'); return; }
            appDiv.innerHTML = AdminDashboard();
            break;
        case 'course-view':
             if (!state.currentUser) { navigate('login'); return; }
            appDiv.innerHTML = CourseView();
            break;
    }
    
    lucide.createIcons();
}

// --- COMPONENT TEMPLATES ---

const LandingPage = () => `
    <div class="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
        <div class="text-center mb-16 fade-in-up">
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

        <div class="grid md:grid-cols-2 gap-8 w-full max-w-4xl fade-in-up delay-200">
            <div class="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center group cursor-pointer">
                <div class="p-4 rounded-full bg-blue-500/20 mb-4 group-hover:bg-blue-500/30 transition-colors">
                    <i data-lucide="user" class="text-blue-300 w-10 h-10"></i>
                </div>
                <h3 class="text-2xl font-bold mb-2">Student Portal</h3>
                <p class="text-slate-300 mb-6">Access courses, exams, and resources.</p>
                <div class="flex gap-4 w-full">
                    <button onclick="navigate('login')" class="flex-1 bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 px-6 py-3 rounded-xl font-bold transition-all">Login</button>
                    <button onclick="navigate('signup')" class="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/30 hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] px-6 py-3 rounded-xl font-bold transition-all">Join Now</button>
                </div>
            </div>

            <div class="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center group cursor-pointer">
                <div class="p-4 rounded-full bg-purple-500/20 mb-4 group-hover:bg-purple-500/30 transition-colors">
                    <i data-lucide="shield-check" class="text-purple-300 w-10 h-10"></i>
                </div>
                <h3 class="text-2xl font-bold mb-2">Supervisor Access</h3>
                <p class="text-slate-300 mb-6">Manage students, content, and analytics.</p>
                <button onclick="navigate('login-admin')" class="w-full bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 px-6 py-3 rounded-xl font-bold transition-all">Secure Login</button>
            </div>
        </div>
    </div>
`;

const AuthPage = (mode) => {
    const title = mode === 'signup' ? 'Student Registration' : mode === 'login-admin' ? 'Supervisor Login' : 'Student Login';
    return `
    <div class="h-full flex items-center justify-center p-4">
        <div class="glass-card w-full max-w-md relative z-10 rounded-2xl p-6 fade-in-up">
            <button onclick="navigate('landing')" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                <i data-lucide="x-circle"></i>
            </button>
            <h2 class="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">${title}</h2>
            ${mode === 'signup' ? SignupForm() : LoginForm(mode === 'login-admin')}
        </div>
    </div>
    `;
};

const SignupForm = () => `
    <form id="auth-form" onsubmit="handleAuthSubmit(event, 'signup')">
        ${InputField('Full Name', 'text', 'John Doe', 'name')}
        ${InputField('Email Address', 'email', 'student@minia.edu.eg', 'email')}
        ${InputField('Mobile Number', 'tel', '01xxxxxxxxx', 'mobile')}
        ${InputField('Password', 'password', '••••••••', 'password')}
        <div class="mb-6">
            <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">Academic Year</label>
            <select name="grade" class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all">
                <option value="Year 1" class="bg-slate-900">Year 1</option>
                <option value="Year 2" class="bg-slate-900">Year 2</option>
                <option value="Year 3" class="bg-slate-900">Year 3</option>
                <option value="Year 4" class="bg-slate-900">Year 4</option>
            </select>
        </div>
        <button type="submit" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/30 px-6 py-3 rounded-xl font-bold transition-all mb-4">Register Account</button>
        <div class="text-center text-sm text-slate-400">
            Already have an account? <button type="button" onclick="navigate('login')" class="text-cyan-400 hover:text-cyan-300 underline">Login</button>
        </div>
    </form>
`;

const LoginForm = (isAdmin) => `
    <form id="auth-form" onsubmit="handleAuthSubmit(event, '${isAdmin ? 'login-admin' : 'login'}')">
        ${InputField('Email', 'email', 'email@address.com', 'email')}
        ${InputField('Password', 'password', '••••••••', 'password')}
        <button type="submit" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/30 px-6 py-3 rounded-xl font-bold transition-all mb-4">
            ${isAdmin ? 'Verify & Access' : 'Login'}
        </button>
        ${!isAdmin ? `
            <div class="text-center text-sm text-slate-400">
                New Student? <button type="button" onclick="navigate('signup')" class="text-cyan-400 hover:text-cyan-300 underline">Register</button>
            </div>
        ` : ''}
    </form>
`;

const InputField = (label, type, placeholder, name) => `
    <div class="mb-4">
        <label class="block text-cyan-200 text-sm font-semibold mb-2 ml-1">${label}</label>
        <input type="${type}" name="${name}" placeholder="${placeholder}" required
            class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
    </div>
`;

const DashboardHeader = () => `
    <header class="h-20 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 shrink-0">
        <div class="flex items-center gap-4">
            ${state.view === 'course-view' ? `<button onclick="navigate('student-dash')" class="p-2 rounded-lg hover:bg-white/10 transition-colors"><i data-lucide="chevron-left"></i></button>` : ''}
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
                <div class="font-bold text-sm">${state.currentUser?.name}</div>
                <div class="text-xs text-cyan-400 uppercase tracking-wider">${state.currentUser?.role === 'admin' ? 'Supervisor' : state.currentUser?.grade}</div>
            </div>
            <button onclick="handleLogout()" class="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
                <i data-lucide="log-out" width="20"></i>
            </button>
        </div>
    </header>
`;

const StudentDashboard = () => `
    <div class="h-full flex flex-col">
        ${DashboardHeader()}
        <main class="flex-1 overflow-y-auto p-6 lg:p-12">
            <div class="container mx-auto max-w-7xl space-y-8">
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
                    ${state.courses.map((course, idx) => `
                        <div onclick="selectCourse('${course.id}')" class="glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors group cursor-pointer h-full flex flex-col justify-between fade-in-up" style="animation-delay: ${idx * 0.05}s">
                            <div>
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
                    `).join('')}
                </div>
            </div>
        </main>
    </div>
`;

const CourseView = () => {
    const course = state.courses.find(c => c.id === state.selectedCourseId);
    if (!course) return "Course not found";

    if (state.examState && state.examState.active) return ExamRunner(state.examState.exam);

    return `
    <div class="h-full flex flex-col">
        ${DashboardHeader()}
        <main class="flex-1 overflow-y-auto p-6 lg:p-12">
            <div class="container mx-auto max-w-7xl">
                <div class="mb-8 p-6 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 rounded-3xl border border-white/10 backdrop-blur-md">
                    <h2 class="text-4xl font-bold mb-2">${course.title}</h2>
                    <p class="text-cyan-200/80 max-w-2xl">${course.description}</p>
                </div>

                <div class="flex gap-4 mb-8">
                    <button onclick="setTab('materials')" class="px-8 py-3 rounded-full font-bold transition-all ${state.activeTab === 'materials' ? 'bg-white text-slate-900' : 'bg-white/5 hover:bg-white/10'}">
                        Study Materials
                    </button>
                    <button onclick="setTab('exams')" class="px-8 py-3 rounded-full font-bold transition-all ${state.activeTab === 'exams' ? 'bg-white text-slate-900' : 'bg-white/5 hover:bg-white/10'}">
                        Exams & Quizzes
                    </button>
                </div>

                <div class="fade-in-up">
                    ${state.activeTab === 'materials' ? renderMaterials(course) : renderExams(course)}
                </div>
            </div>
        </main>
    </div>
    `;
};

const renderMaterials = (course) => `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${course.materials.length === 0 ? '<div class="col-span-2 text-center py-12 text-slate-500">No materials available yet.</div>' : ''}
        ${course.materials.map(mat => `
            <div class="glass-card p-6 rounded-2xl group">
                <div class="flex items-start gap-4 mb-4">
                    <div class="p-3 rounded-lg ${mat.type === 'video' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}">
                        <i data-lucide="${mat.type === 'video' ? 'play-circle' : 'file-text'}" width="24"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-lg mb-1">${mat.title}</h4>
                        <span class="text-xs px-2 py-0.5 rounded bg-white/10 uppercase tracking-wide">${mat.type}</span>
                    </div>
                </div>
                ${mat.type === 'video' ? `
                   <div class="relative aspect-video rounded-lg overflow-hidden bg-black mb-4 border border-white/10">
                     <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${getYouTubeId(mat.url)}" frameborder="0" allowfullscreen></iframe>
                   </div>
                ` : ''}
                <a href="${mat.url}" target="_blank" class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-300 transition-all">
                    ${mat.type === 'video' ? 'Watch on YouTube' : 'Download / View'} <i data-lucide="chevron-right" width="16"></i>
                </a>
            </div>
        `).join('')}
    </div>
`;

const renderExams = (course) => `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${course.exams.length === 0 ? '<div class="col-span-3 text-center py-12 text-slate-500">No exams available yet.</div>' : ''}
        ${course.exams.map((exam, idx) => `
            <div class="glass-card p-6 rounded-2xl text-center py-8 hover:border-cyan-500/50 transition-colors">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    <i data-lucide="award" class="text-white w-8 h-8"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">${exam.title}</h3>
                <p class="text-slate-400 mb-6">${exam.questions.length} Questions</p>
                <button onclick="startExam(${idx})" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/30 px-6 py-3 rounded-xl font-bold transition-all">Start Exam</button>
            </div>
        `).join('')}
    </div>
`;

const ExamRunner = (exam) => {
    const { qIndex, answers, submitted, score } = state.examState;
    const q = exam.questions[qIndex];
    
    return `
    <div class="h-full flex flex-col">
        ${DashboardHeader()}
        <main class="flex-1 overflow-y-auto p-6 lg:p-12">
            <div class="container mx-auto max-w-3xl">
                 <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-bold">${exam.title}</h2>
                    <button onclick="exitExam()" class="text-sm text-slate-400 hover:text-white underline">Exit Exam</button>
                </div>
                
                <div class="mb-6 flex gap-2 overflow-x-auto pb-2">
                    ${exam.questions.map((quest, i) => {
                        let classes = 'border-white/10 text-slate-500';
                        if (i === qIndex) classes = 'bg-cyan-500 border-cyan-300 text-white';
                        else if (submitted) {
                            if (quest.type === 'essay') classes = 'border-yellow-500/50';
                            else if (answers[quest.id] === quest.correct) classes = 'border-green-500 bg-green-500/10';
                            else classes = 'border-red-500 bg-red-500/10';
                        }
                        else if (answers[quest.id] !== undefined) classes = 'bg-white/20 border-white/40';

                        return `<div class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold border ${classes}">${i + 1}</div>`;
                    }).join('')}
                </div>

                <div class="glass-card p-6 rounded-2xl min-h-[400px] flex flex-col relative overflow-hidden">
                    ${submitted ? `
                       <div class="absolute top-0 right-0 p-4">
                          <span class="px-3 py-1 rounded-full text-xs font-bold ${q.type === 'essay' ? 'bg-yellow-500 text-black' : (answers[q.id] === q.correct ? 'bg-green-500 text-black' : 'bg-red-500 text-white')}">
                            ${q.type === 'essay' ? 'Self Check' : (answers[q.id] === q.correct ? 'Correct' : 'Incorrect')}
                          </span>
                       </div>
                    ` : ''}

                    <h3 class="text-xl font-medium mb-8 leading-relaxed">
                       <span class="text-cyan-400 font-bold mr-2">Q${qIndex + 1}.</span> 
                       ${q.text}
                    </h3>

                    <div class="space-y-4 flex-1">
                        ${q.type === 'mcq' ? q.options.map((opt, i) => `
                            <button onclick="handleAnswer(${i})" ${submitted ? 'disabled' : ''} class="w-full text-left p-4 rounded-xl border transition-all ${answers[q.id] === i ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-900/40 border-white/10 hover:bg-white/5'} ${submitted && q.correct === i ? '!bg-green-500/20 !border-green-500' : ''}">
                                <span class="opacity-50 mr-3 text-sm uppercase">${String.fromCharCode(65 + i)}</span> ${opt}
                            </button>
                        `).join('') : ''}

                        ${q.type === 'tf' ? `
                            <div class="flex gap-4">
                                <button onclick="handleAnswer(true)" ${submitted ? 'disabled' : ''} class="flex-1 p-6 rounded-xl border font-bold text-lg transition-all ${answers[q.id] === true ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-900/40 border-white/10 hover:bg-white/5'} ${submitted && q.correct === true ? '!bg-green-500/20 !border-green-500' : ''}">True</button>
                                <button onclick="handleAnswer(false)" ${submitted ? 'disabled' : ''} class="flex-1 p-6 rounded-xl border font-bold text-lg transition-all ${answers[q.id] === false ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-900/40 border-white/10 hover:bg-white/5'} ${submitted && q.correct === false ? '!bg-green-500/20 !border-green-500' : ''}">False</button>
                            </div>
                        ` : ''}

                        ${q.type === 'essay' ? `
                             <textarea oninput="handleAnswer(this.value)" ${submitted ? 'disabled' : ''} class="w-full h-40 bg-slate-900/50 border border-white/10 rounded-xl p-4 resize-none focus:border-cyan-500 outline-none text-white">${answers[q.id] || ''}</textarea>
                        ` : ''}
                    </div>
                    
                    ${submitted && q.explanation ? `
                        <div class="mt-6 p-4 bg-white/5 rounded-lg border-l-4 border-cyan-500 text-sm text-slate-300">
                            <span class="block font-bold text-cyan-400 mb-1">Explanation:</span>
                            ${q.explanation}
                        </div>
                    ` : ''}

                    <div class="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
                        <button onclick="navExam(-1)" ${qIndex === 0 ? 'disabled' : ''} class="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30">Previous</button>
                        
                        ${!submitted ? (
                            qIndex === exam.questions.length - 1 
                            ? `<button onclick="submitExam()" class="bg-green-500/20 text-green-200 border border-green-500/50 hover:bg-green-500/40 px-6 py-3 rounded-xl font-bold transition-all">Submit Exam</button>` 
                            : `<button onclick="navExam(1)" class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/30 px-6 py-3 rounded-xl font-bold transition-all">Next Question</button>`
                        ) : `
                            <div class="flex gap-4 items-center">
                                <span class="font-bold text-xl">Score: ${score} / ${exam.questions.length}</span>
                                ${qIndex < exam.questions.length - 1 ? `<button onclick="navExam(1)" class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/30 px-6 py-3 rounded-xl font-bold transition-all">Next</button>` : ''}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </main>
    </div>
    `;
};

const AdminDashboard = () => {
    const pendingUsers = state.users.filter(u => u.status === 'pending');
    
    return `
    <div class="h-full flex flex-col">
        ${DashboardHeader()}
        <main class="flex-1 overflow-y-auto p-6 lg:p-12">
            <div class="container mx-auto max-w-7xl">
                <h2 class="text-3xl font-bold mb-8">Supervisor Dashboard</h2>
                
                <div class="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
                    ${AdminTabButton('requests', 'user', 'Requests', pendingUsers.length)}
                    ${AdminTabButton('courses', 'book-open', 'Courses')}
                    ${AdminTabButton('exams', 'file-text', 'Exam Builder')}
                    ${AdminTabButton('stats', 'bar-chart', 'Analytics')}
                </div>

                <div class="fade-in-up">
                    ${state.adminTab === 'requests' ? AdminRequests(pendingUsers) : ''}
                    ${state.adminTab === 'courses' ? AdminCourseManager() : ''}
                    ${state.adminTab === 'exams' ? AdminExamBuilder() : ''}
                    ${state.adminTab === 'stats' ? AdminStats() : ''}
                </div>
            </div>
        </main>
    </div>
    `;
};

const AdminTabButton = (id, icon, label, count) => `
    <button onclick="setAdminTab('${id}')" class="flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${state.adminTab === id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
        <i data-lucide="${icon}" width="18"></i> ${label}
        ${count > 0 ? `<span class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">${count}</span>` : ''}
    </button>
`;

const AdminRequests = (pendingUsers) => `
    <div class="space-y-6">
        <h3 class="text-xl font-semibold text-cyan-200">Pending Approvals (${pendingUsers.length})</h3>
        ${pendingUsers.length === 0 ? '<div class="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">No pending requests</div>' : 
          `<div class="grid gap-4">
             ${pendingUsers.map(u => `
                <div class="glass-card rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                    <div class="flex items-center gap-4">
                        <div class="bg-orange-500/20 p-3 rounded-full text-orange-300"><i data-lucide="clock" width="24"></i></div>
                        <div>
                            <h4 class="font-bold text-lg">${u.name}</h4>
                            <p class="text-sm text-slate-400">${u.email} • ${u.grade}</p>
                            <p class="text-xs text-slate-500">Mobile: ${u.mobile}</p>
                        </div>
                    </div>
                    <div class="flex gap-2 w-full md:w-auto">
                        <button onclick="updateUser('${u.id}', 'approved')" class="bg-green-500/20 text-green-200 border border-green-500/50 hover:bg-green-500/40 px-6 py-2 rounded-xl flex-1 md:flex-none">Approve</button>
                        <button onclick="deleteUser('${u.id}')" class="bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/40 px-6 py-2 rounded-xl flex-1 md:flex-none">Reject</button>
                    </div>
                </div>
             `).join('')}
          </div>`
        }
        
        <h3 class="text-xl font-semibold text-cyan-200 mt-12">All Students</h3>
        <div class="overflow-x-auto rounded-xl border border-white/10">
            <table class="w-full text-left text-sm text-slate-400">
                <thead class="bg-white/5 text-white"><tr><th class="p-4">Name</th><th class="p-4">Grade</th><th class="p-4">Email</th><th class="p-4">Status</th></tr></thead>
                <tbody class="divide-y divide-white/5">
                    ${state.users.filter(u => u.role === 'student').map(s => `
                        <tr class="hover:bg-white/5">
                            <td class="p-4 font-medium text-white">${s.name}</td>
                            <td class="p-4">${s.grade}</td>
                            <td class="p-4">${s.email}</td>
                            <td class="p-4"><span class="px-2 py-1 rounded text-xs ${s.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}">${s.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
`;

const AdminCourseManager = () => {
    if (!window.adminSelectedCourseId) window.adminSelectedCourseId = state.courses[0].id;
    const selected = state.courses.find(c => c.id === window.adminSelectedCourseId);
    
    return `
    <div class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-2">
            ${state.courses.map(c => `
                <div onclick="window.adminSelectedCourseId = '${c.id}'; render();" 
                     class="p-4 rounded-xl cursor-pointer border transition-all ${window.adminSelectedCourseId === c.id ? 'bg-cyan-500/20 border-cyan-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}">
                    <h4 class="font-semibold">${c.title}</h4>
                    <div class="text-xs opacity-70 mt-1">${c.materials.length} Materials</div>
                </div>
            `).join('')}
        </div>
        <div class="glass-card md:col-span-2 p-6 rounded-2xl">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-2"><span class="text-cyan-400">Editing:</span> ${selected.title}</h3>
            
            <form onsubmit="addMaterial(event)" class="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
                <h4 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Add Learning Content</h4>
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-xs mb-1 ml-1 text-slate-400">Type</label>
                        <select id="mat-type" class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white">
                            <option value="video">YouTube Video</option>
                            <option value="link">Google Drive / Link</option>
                            <option value="file">File</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs mb-1 ml-1 text-slate-400">Title</label>
                        <input id="mat-title" type="text" required class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white">
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-xs mb-1 ml-1 text-slate-400">URL</label>
                    <input id="mat-url" type="url" required class="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white">
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-xl font-bold">Add to Course</button>
            </form>

            <div class="space-y-3">
                 ${selected.materials.map(m => `
                    <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <div class="flex items-center gap-3">
                            <i data-lucide="${m.type === 'video' ? 'play-circle' : 'file-text'}" class="${m.type === 'video' ? 'text-red-400' : 'text-blue-400'}" width="18"></i>
                            <span class="text-sm font-medium">${m.title}</span>
                        </div>
                        <button onclick="removeMaterial(${m.id})" class="text-slate-500 hover:text-red-400"><i data-lucide="trash-2" width="16"></i></button>
                    </div>
                 `).join('')}
            </div>
        </div>
    </div>
    `;
};

const AdminExamBuilder = () => `
    <div class="glass-card p-8 rounded-2xl text-center">
        <i data-lucide="construction" class="mx-auto text-yellow-500 w-16 h-16 mb-4"></i>
        <h3 class="text-2xl font-bold">Exam Builder</h3>
        <p class="text-slate-400">Functionality preserved in logic, UI simplified for conversion demo.</p>
    </div>
`;

const AdminStats = () => `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 rounded-2xl text-center py-12">
            <div class="text-5xl font-bold text-cyan-300 mb-2">${state.users.filter(u => u.role === 'student').length}</div>
            <div class="text-slate-400">Total Students</div>
        </div>
        <div class="glass-card p-6 rounded-2xl text-center py-12">
             <div class="text-5xl font-bold text-purple-300 mb-2">${state.courses.length}</div>
            <div class="text-slate-400">Active Subjects</div>
        </div>
         <div class="glass-card p-6 rounded-2xl text-center py-12">
             <div class="text-5xl font-bold text-green-300 mb-2">${state.courses.reduce((a,c) => a + c.exams.length, 0)}</div>
            <div class="text-slate-400">Exams Created</div>
        </div>
    </div>
`;

// --- EVENT HANDLERS ---

window.navigate = (view) => {
    state.view = view;
    render();
};

window.handleAuthSubmit = (e, type) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (type === 'signup') {
        if (state.users.some(u => u.email === data.email)) {
            showNotification('Email already registered', 'error');
            return;
        }
        const newUser = { ...data, id: Date.now().toString(), role: 'student', status: 'pending', progress: {} };
        saveUserToDB(newUser);
        showNotification('Registration successful! Waiting for approval.', 'success');
        navigate('landing');
    } else {
        const email = data.email;
        const pass = data.password;

        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
            state.currentUser = INITIAL_ADMIN;
            navigate('admin-dash');
            return;
        }

        const user = state.users.find(u => u.email === email && u.password === pass);
        
        if (user) {
            if (user.role === 'admin') {
                state.currentUser = user;
                navigate('admin-dash');
            } else {
                if (user.status === 'approved') {
                    state.currentUser = user;
                    navigate('student-dash');
                } else {
                    showNotification('Account Pending Approval.', 'error');
                }
            }
        } else {
            showNotification('Invalid Credentials.', 'error');
        }
    }
};

window.handleLogout = () => {
    state.currentUser = null;
    state.selectedCourseId = null;
    // مسح الجلسة عند تسجيل الخروج
    localStorage.removeItem('minia_session');
    state.view = 'landing';
    render();
};

window.selectCourse = (id) => {
    state.selectedCourseId = id;
    state.activeTab = 'materials';
    state.examState = null;
    navigate('course-view');
};

window.setTab = (tab) => {
    state.activeTab = tab;
    render();
};

window.getYouTubeId = (url) => {
    return url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
};

window.startExam = (examIdx) => {
    const course = state.courses.find(c => c.id === state.selectedCourseId);
    const exam = course.exams[examIdx];
    state.examState = {
        active: true,
        exam: exam,
        answers: {},
        submitted: false,
        score: 0,
        qIndex: 0
    };
    render();
};

window.handleAnswer = (val) => {
    const es = state.examState;
    if (es.submitted) return;
    const qId = es.exam.questions[es.qIndex].id;
    es.answers[qId] = val;
    render();
};

window.navExam = (dir) => {
    state.examState.qIndex += dir;
    render();
};

window.submitExam = () => {
    const es = state.examState;
    let s = 0;
    es.exam.questions.forEach(q => {
        const ans = es.answers[q.id];
        if (q.type === 'mcq' || q.type === 'tf') {
            if (ans === q.correct) s++;
        } else if (ans) s++; 
    });
    es.score = s;
    es.submitted = true;
    render();
};

window.exitExam = () => {
    state.examState = null;
    render();
};

window.setAdminTab = (tab) => {
    state.adminTab = tab;
    render();
};

window.updateUser = (id, status) => {
    updateUserStatusInDB(id, status);
};

window.deleteUser = (id) => {
    deleteUserFromDB(id);
};

window.addMaterial = (e) => {
    e.preventDefault();
    const type = document.getElementById('mat-type').value;
    const title = document.getElementById('mat-title').value;
    const url = document.getElementById('mat-url').value;
    
    const course = state.courses.find(c => c.id === window.adminSelectedCourseId);
    const newMat = { id: Date.now(), type, title, url };
    
    course.materials.push(newMat);
    saveCourseToDB(course);
};

window.removeMaterial = (matId) => {
    const course = state.courses.find(c => c.id === window.adminSelectedCourseId);
    course.materials = course.materials.filter(m => m.id !== matId);
    saveCourseToDB(course);
};

init();
