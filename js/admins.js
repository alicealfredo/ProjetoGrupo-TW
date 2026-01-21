document.addEventListener("DOMContentLoaded", () => {

    if (!isAdmin()) {
        alert("Acesso negado! Apenas administradores podem aceder a esta página.");
        window.location.href = "inicio.html";
        return;
    }

   
    let adminLinks = document.querySelectorAll('.admin-only');
    adminLinks.forEach(link => {
        link.style.display = isAdmin() ? 'block' : 'none';
    });

    renderUsers();
    setupEventListeners();
});

function renderUsers() {
    let tbody = document.getElementById("users-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    Nenhum utilizador encontrado.
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name || 'Sem nome'}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${user.email === 'admin@gmail.com' && user.password === 'admin' ? 'bg-danger' : 'bg-primary'}">
                    ${user.email === 'admin@gmail.com' && user.password === 'admin' ? 'Administrador' : 'Utilizador Comum'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-user" data-id="${user.id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                ${user.email !== 'admin@gmail.com' ? `
                    <button class="btn btn-sm btn-outline-danger delete-user" data-id="${user.id}">
                        <i class="bi bi-trash"></i> Remover
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });

    attachUserEvents();
}

function attachUserEvents() {
   
    document.querySelectorAll(".edit-user").forEach(btn => {
        btn.addEventListener("click", e => {
            let userId = parseInt(e.currentTarget.dataset.id);
            let user = users.find(u => u.id === userId);
            if (!user) return;

            document.getElementById("editUserId").value = user.id;
            document.getElementById("editUserName").value = user.name || "";
            document.getElementById("editUserEmail").value = user.email;
            
            
            let isAdminUser = user.email === 'admin@gmail.com' && user.password === 'admin';
            document.getElementById("editUserRole").value = isAdminUser ? "admin" : "user";

            let modal = new bootstrap.Modal(document.getElementById("editUserModal"));
            modal.show();
        });
    });

    
    document.querySelectorAll(".delete-user").forEach(btn => {
        btn.addEventListener("click", e => {
            let userId = parseInt(e.currentTarget.dataset.id);
            let user = users.find(u => u.id === userId);
            if (!user) return;

            if (confirm(`Tem certeza que deseja remover o utilizador "${user.name}" (${user.email})?`)) {
                deleteUser(userId);
            }
        });
    });
}

function setupEventListeners() {
    
    let addBtn = document.getElementById("btnAddUser");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            document.getElementById("addUserForm").reset();
            let modal = new bootstrap.Modal(document.getElementById("addUserModal"));
            modal.show();
        });
    }

    
    let createBtn = document.getElementById("btnCreateUser");
    if (createBtn) {
        createBtn.addEventListener("click", () => {
            let form = document.getElementById("addUserForm");
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            let name = document.getElementById("newUserName").value.trim();
            let email = document.getElementById("newUserEmail").value.trim();
            let password = document.getElementById("newUserPassword").value;
            let role = document.getElementById("newUserRole").value;

            
            if (users.some(u => u.email === email)) {
                alert("Este email já está registado!");
                return;
            }

            let newUser = {
                id: users.length + 1,
                name: name,
                email: email,
                password: password,
                profilePicture: null,
                favorites: [],
                likes: [],
                plans: {},
                role: role
            };

            users.push(newUser);
            saveToStorage("users", users);

            bootstrap.Modal.getInstance(document.getElementById("addUserModal"))?.hide();
            alert(`Utilizador "${name}" criado com sucesso!`);
            renderUsers();
        });
    }

    
    let saveBtn = document.getElementById("btnSaveUser");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            let userId = parseInt(document.getElementById("editUserId").value);
            let user = users.find(u => u.id === userId);
            if (!user) return;

            let newName = document.getElementById("editUserName").value.trim();
            let newEmail = document.getElementById("editUserEmail").value.trim();
            let newPassword = document.getElementById("editUserPassword").value;
            let newRole = document.getElementById("editUserRole").value;

            
            if (users.some(u => u.email === newEmail && u.id !== userId)) {
                alert("Este email já está registado por outro utilizador!");
                return;
            }

            
            user.name = newName;
            user.email = newEmail;
            
            if (newPassword) {
                user.password = newPassword;
            }
            if (newRole === "admin") {
                user.email = "admin@gmail.com";
                user.password = "admin";
            }

            saveToStorage("users", users);

            
            if (currentUser && currentUser.id === userId) {
                currentUser.name = user.name;
                currentUser.email = user.email;
                if (newPassword) {
                    currentUser.password = user.password;
                }
                saveToStorage("currentUser", currentUser);
            }

            bootstrap.Modal.getInstance(document.getElementById("editUserModal"))?.hide();
            alert("Utilizador atualizado com sucesso!");
            renderUsers();
        });
    }
}

function deleteUser(userId) {
    if (!isAdmin()) {
        alert("Apenas administradores podem remover utilizadores!");
        return;
    }

    let user = users.find(u => u.id === userId);
    if (!user) return;

    
    if (user.email === 'admin@gmail.com' && user.password === 'admin') {
        alert("Não é possível remover o administrador principal!");
        return;
    }

    
    users = users.filter(u => u.id !== userId);
    saveToStorage("users", users);

    
    if (currentUser && currentUser.id === userId) {
        logout();
        return;
    }

    alert(`Utilizador "${user.name}" removido com sucesso!`);
    renderUsers();
}
