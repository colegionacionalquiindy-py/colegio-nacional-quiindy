// js/users.js - User management with API support

// Demo users data (used as fallback when API not available)
const demoUsers = [
    {
        id: "1",
        name: "Administrador Principal",
        username: "admin",
        email: "admin@quiindy.edu.py",
        password: "admin123",
        role: "admin",
        isActive: true,
        createdAt: "2025-01-01",
        lastLogin: "Nunca",
        avatar: "A",
        avatarColor: "#22c55e"
    },
    {
        id: "2",
        name: "Karen Jave",
        username: "karen.jave",
        email: "karen.jave@estudiante.edu.py",
        password: "alumno123",
        role: "user",
        isActive: true,
        createdAt: "2025-01-15",
        lastLogin: "2025-08-20",
        avatar: "K",
        avatarColor: "#3b82f6"
    },
    {
        id: "3",
        name: "Carlos Mendoza",
        username: "carlos.m",
        email: "carlos.mendoza@estudiante.edu.py",
        password: "alumno123",
        role: "user",
        isActive: true,
        createdAt: "2025-02-01",
        lastLogin: "2025-08-19",
        avatar: "C",
        avatarColor: "#f59e0b"
    },
    {
        id: "4",
        name: "María López",
        username: "maria.l",
        email: "maria.lopez@profesor.edu.py",
        password: "prof123",
        role: "user",
        isActive: true,
        createdAt: "2025-01-10",
        lastLogin: "2025-08-18",
        avatar: "M",
        avatarColor: "#8b5cf6"
    },
    {
        id: "5",
        name: "Luis Fernández",
        username: "luis.f",
        email: "luis.fernandez@estudiante.edu.py",
        password: "alumno123",
        role: "user",
        isActive: false,
        createdAt: "2025-03-01",
        lastLogin: "2025-07-15",
        avatar: "L",
        avatarColor: "#ef4444"
    },
    {
        id: "6",
        name: "Ana Pérez",
        username: "ana.p",
        email: "ana.perez@profesor.edu.py",
        password: "prof123",
        role: "user",
        isActive: true,
        createdAt: "2025-02-15",
        lastLogin: "2025-08-20",
        avatar: "A",
        avatarColor: "#06b6d4"
    }
];

// Current logged in user
let currentUser = null;
let allUsers = [...demoUsers];

// Login function
async function loginUser(username, password) {
    // Try API first
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const data = await response.json();
            allUsers = data.users || demoUsers;
        }
    } catch (e) {
        console.log('API not available, using demo users');
        allUsers = demoUsers;
    }

    const user = allUsers.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = { ...user };
        currentUser.lastLogin = new Date().toISOString().split('T')[0];
        
        // Update last login in stored users
        const userIndex = allUsers.findIndex(u => u.username === username);
        if (userIndex >= 0) {
            allUsers[userIndex].lastLogin = currentUser.lastLogin;
            saveUsers();
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' };
}

// Logout function
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Get current user
function getCurrentUser() {
    if (!currentUser) {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    }
    return currentUser;
}

// Get all users
async function getAllUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const data = await response.json();
            return data.users || demoUsers;
        }
    } catch (e) {
        console.log('API not available, using demo users');
    }
    return allUsers;
}

// Create or update user (admin panel)
async function saveUser(user) {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return response.json();
}

// Delete user (admin panel)
async function deleteUser(id) {
    const response = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: 'DELETE'
    });
    return response.json();
}

// Save users to localStorage (fallback when API unavailable)
function saveUsers() {
    if (window.location.pathname.includes('admin.html')) {
        // In admin panel, use API
        allUsers.forEach(user => saveUser(user));
    } else {
        // Fallback to localStorage
        localStorage.setItem('jaikeWebUsers', JSON.stringify(allUsers));
    }
}

// Load users from localStorage or API
function loadUsers() {
    const stored = localStorage.getItem('jaikeWebUsers');
    if (stored) {
        try {
            allUsers = JSON.parse(stored);
        } catch (e) {
            allUsers = [...demoUsers];
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved session
    const user = getCurrentUser();
    if (user) {
        const loginBtn = document.getElementById('login-btn');
        const dashboard = document.getElementById('student-dashboard');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (dashboard) dashboard.classList.add('active');
        
        const avatarEl = document.getElementById('student-avatar');
        const nameEl = document.getElementById('student-name');
        const roleEl = document.getElementById('student-role');
        
        if (avatarEl) avatarEl.textContent = user.avatar || user.name?.[0] || 'U';
        if (nameEl) nameEl.textContent = user.name || user.username;
        if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrador' : 'Estudiante';
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.username.value;
            const password = this.password.value;
            
            loginUser(username, password).then(result => {
                if (result.success) {
                    window.location.reload();
                } else {
                    alert(result.error);
                }
            });
        });
    }
    
    // Setup close login modal
    const closeLogin = document.getElementById('close-login');
    const loginModal = document.getElementById('login-modal');
    
    if (closeLogin) {
        closeLogin.addEventListener('click', function() {
            if (loginModal) loginModal.classList.remove('active');
        });
    }
    
    // Setup login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (loginModal) loginModal.classList.add('active');
        });
    }
});

// Export global functions
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.getAllUsers = getAllUsers;
window.saveUser = saveUser;
window.deleteUser = deleteUser;

// Create JaikeUsers namespace object for script.js compatibility
const JaikeUsers = {
    getAllUsers: getAllUsers,
    getCurrentUser: getCurrentUser,
    findUser: loginUser,
    setCurrentUser: function(user) {
        currentUser = { ...user };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    },
    logout: logoutUser,
    isCurrentUserAdmin: function() {
        const user = getCurrentUser();
        return user && user.role === 'admin' && user.isActive;
    },
    saveUsers: saveUsers
};
window.JaikeUsers = JaikeUsers;