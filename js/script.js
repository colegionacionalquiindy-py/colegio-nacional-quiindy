// Jaike.Web - Script Principal
document.addEventListener("DOMContentLoaded", function () {
    // === CARGAR USUARIOS (si no existen, inicializar con demo) ===
    JaikeUsers.getAllUsers();

    // === DARK MODE TOGGLE ===
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem("theme") || "light";
        if (currentTheme === "dark") {
            document.body.classList.add("dark-mode");
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Claro';
        }
        themeToggleBtn.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = isDark
                    ? '<i class="fas fa-sun"></i> Claro'
                    : '<i class="fas fa-moon"></i> Oscuro';
            }
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    // === LOGIN SYSTEM ===
    const loginBtn = document.getElementById("login-btn");
    const loginModal = document.getElementById("login-modal");
    const closeLogin = document.getElementById("close-login");
    const loginForm = document.getElementById("login-form");
    const studentDashboard = document.getElementById("student-dashboard");
    const studentName = document.getElementById("student-name");
    const studentAvatar = document.getElementById("student-avatar");
    const studentRole = document.getElementById("student-role");
    const logoutBtn = document.getElementById("logout-btn");

    function updateStudentDashboard() {
        const user = JaikeUsers.getCurrentUser();
        if (user && studentDashboard) {
            studentDashboard.classList.add("active");
            if (loginBtn) loginBtn.style.display = "none";
            if (studentName) studentName.textContent = user.name;
            if (studentAvatar) studentAvatar.textContent = user.avatar || user.username.charAt(0).toUpperCase();
            if (studentRole) studentRole.textContent = user.role === "admin" ? "Administrador" : "Estudiante";
        }
    }

    if (loginBtn && loginModal) {
        loginBtn.addEventListener("click", function () {
            loginModal.classList.add("active");
            loginModal.querySelector('input[name="username"]').focus();
        });
    }

    if (closeLogin && loginModal) {
        closeLogin.addEventListener("click", function () {
            loginModal.classList.remove("active");
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener("click", function (e) {
            if (e.target === loginModal) {
                loginModal.classList.remove("active");
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const username = loginForm.querySelector('input[name="username"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;

            const result = JaikeUsers.findUser(username, password);
            const user = result?.user || result;
            if (result?.success && user) {
                user.lastLogin = new Date().toISOString().split('T')[0];
                JaikeUsers.setCurrentUser(user);
                updateStudentDashboard();
                checkAdminAccess();
                loginModal.classList.remove("active");

                // Show success message
                showMessage("success", "Bienvenido " + user.name + "! Has iniciado sesion como " + (user.role === "admin" ? "Administrador" : "Estudiante") + ".");
            } else {
                showMessage("error", "Usuario o contrasena incorrectos. Intentalo nuevamente.");
            }
        });
    }

    // Check for existing session on load
    updateStudentDashboard();

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            JaikeUsers.logout();
            if (studentDashboard) studentDashboard.classList.remove("active");
            if (loginBtn) loginBtn.style.display = "flex";
            showMessage("success", "Has cerrado sesion correctamente.");
        });
    }

    // === MESSAGE SYSTEM ===
    function showMessage(type, text) {
        // Remove existing messages
        const existing = document.querySelectorAll(".flash-message");
        existing.forEach(el => el.remove());

        const msg = document.createElement("div");
        msg.className = "flash-message flash-" + type;
        msg.innerHTML = '<i class="fas fa-' + (type === "success" ? "check-circle" : "exclamation-triangle") + '"></i> ' + text;

        // Insert at the top of main or after header
        const header = document.querySelector("header");
        if (header) {
            header.parentNode.insertBefore(msg, header.nextSibling);
        }
    }

    // === SEARCH FUNCTIONALITY ===
    const searchInput = document.getElementById("search-input");
    const resourceCards = document.querySelectorAll(".resource-card");

    if (searchInput && resourceCards.length > 0) {
        searchInput.addEventListener("input", function () {
            const searchTerm = searchInput.value.toLowerCase();
            resourceCards.forEach(card => {
                const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
                const description = card.querySelector("p")?.textContent.toLowerCase() || "";
                const match = title.includes(searchTerm) || description.includes(searchTerm);
                card.style.display = match ? "" : "none";
            });
        });
    }

    // === CATEGORY FILTER ===
    const categoryFilters = document.querySelectorAll(".category-filter");
    const allResourceCards = document.querySelectorAll(".resource-card");

    if (categoryFilters.length > 0) {
        categoryFilters.forEach(filter => {
            filter.addEventListener("click", function () {
                const category = filter.dataset.category;
                categoryFilters.forEach(f => f.classList.remove("active"));
                filter.classList.add("active");

                allResourceCards.forEach(card => {
                    if (category === "all" || card.dataset.category === category) {
                        card.style.display = "";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // === SUBJECT FILTER ===
    const subjectTabs = document.querySelectorAll(".subject-tab");
    if (subjectTabs.length > 0) {
        subjectTabs.forEach(tab => {
            tab.addEventListener("click", function () {
                const subject = tab.dataset.subject;
                subjectTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                const subjectItems = document.querySelectorAll(".subject-item");
                subjectItems.forEach(item => {
                    if (subject === "all" || item.dataset.subject === subject) {
                        item.style.display = "";
                    } else {
                        item.style.display = "none";
                    }
                });
            });
        });
    }

    // === CONTACT FORM ===
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = contactForm.querySelector('input[name="name"]').value;
            const email = contactForm.querySelector('input[name="email"]').value;
            const message = contactForm.querySelector('textarea[name="message"]').value;

            if (name && email && message) {
                showMessage("success", "Gracias " + name + ". Tu mensaje ha sido enviado. Nos pondremos en contacto pronto.");
                contactForm.reset();
            } else {
                showMessage("error", "Por favor completa todos los campos.");
            }
        });
    }

    // === USER MANAGEMENT (Admin Panel) ===
    const adminPanel = document.getElementById("admin-panel");
    const addUserControl = document.getElementById("add-user-btn");
    const userModal = document.getElementById("user-modal");
    const closeUserModal = document.getElementById("close-user-modal");
    const userForm = document.getElementById("user-form");

    function checkAdminAccess() {
        const isAdmin = JaikeUsers.isCurrentUserAdmin();
        const adminWarning = document.getElementById("admin-warning");
        if (adminPanel) {
            if (isAdmin) {
                adminPanel.style.display = "block";
                adminPanel.classList.add("active");
                if (adminWarning) adminWarning.style.display = "none";
            } else {
                adminPanel.style.display = "none";
                adminPanel.classList.remove("active");
                if (adminWarning) adminWarning.style.display = "block";
            }
        }
        if (addUserControl) {
            addUserControl.style.display = isAdmin ? "inline-flex" : "none";
        }
        return isAdmin;
    }

    // Check admin access on page load
    checkAdminAccess();

    if (addUserControl && userModal) {
        addUserControl.addEventListener("click", function () {
            if (userModal) userModal.classList.add("active");
        });
    }

    if (closeUserModal && userModal) {
        closeUserModal.addEventListener("click", function () {
            userModal.classList.remove("active");
        });
    }

    if (userModal) {
        userModal.addEventListener("click", function (e) {
            if (e.target === userModal) {
                userModal.classList.remove("active");
            }
        });
    }

    if (userForm) {
        userForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(userForm);
            const newUser = {
                id: Date.now(),
                username: formData.get("username"),
                email: formData.get("email"),
                name: formData.get("name"),
                role: formData.get("role"),
                password: formData.get("password"),
                isActive: formData.get("isActive") === "true",
                createdAt: new Date().toISOString().split("T")[0],
                avatar: formData.get("name").split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2),
                lastLogin: "Nunca"
            };

            const users = JaikeUsers.getAllUsers();
            users.push(newUser);
            JaikeUsers.saveUsers(users);

            userForm.reset();
            userModal.classList.remove("active");
            showMessage("success", "Usuario " + newUser.name + " creado correctamente.");
            renderUsersTable();
        });
    }

    async function renderUsersTable() {
        const tbody = document.getElementById("users-tbody");
        if (!tbody) return;

        const users = await JaikeUsers.getAllUsers();
        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role === "admin" ? "Administrador" : "Estudiante"}</span></td>
                <td><span class="status-badge status-${user.isActive ? "active" : "inactive"}"></span>${user.isActive ? "Activo" : "Inactivo"}</td>
                <td>${user.createdAt}</td>
                <td>${user.lastLogin || "Nunca"}</td>
            </tr>
        `).join("");
    }

    // Render user table if on admin page
    renderUsersTable();

    // Make functions globally available for admin.html inline scripts
    window.checkAdminAccess = checkAdminAccess;
    window.renderUsersTable = renderUsersTable;

    // === SMOOTH SCROLL ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});
