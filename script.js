// --- FIREBASE CONFIGURATION ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

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
const db = getFirestore(app);

// --- CONSTANTS ---
const ADMIN_EMAIL = "noornady00@gmail.com";
const ADMIN_PASS = "noornady2007";

const INITIAL_SUBJECTS = Array.from({ length: 20 }, (_, i) => ({
  id: `subj-${i + 1}`,
  title: ["Calculus I", "Linear Algebra", "Abstract Algebra", "Real Analysis", "Complex Analysis", "Differential Equations", "Topology", "Number Theory", "Discrete Mathematics", "Probability Theory", "Statistics", "Numerical Analysis", "Geometry", "History of Math", "Mathematical Logic", "Set Theory", "Functional Analysis", "Combinatorics", "Cryptography", "Applied Mathematics"][i] || `Mathematics Subject ${i + 1}`,
  description: "Advanced concepts and theories in mathematics education.",
  materials: [], 
  exams: [] 
}));

// --- STATE MANAGEMENT ---
let state = {
    view: 'landing',
    users: [],
    courses: [],
    currentUser: null,
    selectedCourseId: null,
    notification: null,
    loginEmail: '',
    loginPass: '',
    signupForm: { name: '', email: '', password: '', mobile: '', grade: 'Year 1' },
    adminTab: 'requests',
    newMaterial: { type: 'video', title: '', url: '' },
    courseViewTab: 'materials',
    activeExam: null
};

// --- CORE FUNCTIONS (FIREBASE CONNECTED) ---

async function init() {
    // استماع لحظي للبيانات (Real-time) لضمان وصول طلبات التسجيل فوراً للمشرف
    onSnapshot(doc(db, "minia_data", "app_storage"), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            state.users = data.users || [];
            state.courses = data.courses || INITIAL_SUBJECTS;
        } else {
            // تهيئة القاعدة لأول مرة
            saveData([ { id: 'admin-1', name: 'Noor Nady', email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'admin', status: 'approved' } ], INITIAL_SUBJECTS);
        }
        render();
    });
}

async function saveData(users, courses) {
    try {
        await setDoc(doc(db, "minia_data", "app_storage"), { users, courses });
    } catch (e) {
        showNotification("Error syncing data", "error");
    }
}

// تسجيل الدخول
window.handleLogin = function(e) {
    e.preventDefault();
    const { loginEmail, loginPass } = state;

    // التحقق من بيانات المشرف المحددة
    if (loginEmail === ADMIN_EMAIL && loginPass === ADMIN_PASS) {
        state.currentUser = { name: 'Noor Nady', email: ADMIN_EMAIL, role: 'admin' };
        window.setView('admin-dash');
        return;
    }

    const user = state.users.find(u => u.email === loginEmail && u.password === loginPass);
    if (user) {
        if (user.status === 'approved') {
            state.currentUser = user;
            window.setView(user.role === 'admin' ? 'admin-dash' : 'student-dash');
        } else {
            showNotification("Your request is still pending supervisor approval.", "error");
        }
    } else {
        showNotification("Invalid email or password.", "error");
    }
}

// طلب تسجيل جديد (يصل للمشرف فوراً)
window.handleSignup = async function(e) {
    e.preventDefault();
    if (state.users.some(u => u.email === state.signupForm.email)) {
        showNotification("Email already exists.", "error");
        return;
    }
    const newUser = { ...state.signupForm, id: Date.now().toString(), role: 'student', status: 'pending' };
    const updatedUsers = [...state.users, newUser];
    await saveData(updatedUsers, state.courses);
    showNotification("Registration sent! Wait for supervisor approval.", "success");
    window.setView('landing');
}

// اعتماد الطالب من قبل المشرف
window.adminApproveUser = async function(id) {
    const updatedUsers = state.users.map(u => u.id === id ? { ...u, status: 'approved' } : u);
    await saveData(updatedUsers, state.courses);
    showNotification("Student approved successfully.");
}

// --- UI HELPERS (NO CHANGES IN LOGIC) ---
window.setView = (v) => { state.view = v; render(); };
function showNotification(msg, type = 'info') { state.notification = { msg, type }; render(); setTimeout(() => { state.notification = null; render(); }, 3000); }

// (بقية دوال الـ Render مثل StarBackground و renderLanding تظل كما هي في الكود الأصلي لديك لضمان عدم تغيير الشكل)
// يتم استدعاء render() في نهاية كل عملية
// ... (كود الـ HTML Generation الذي تم تزويدك به سابقاً) ...

init();
