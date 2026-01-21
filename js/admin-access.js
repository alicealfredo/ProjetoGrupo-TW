
document.addEventListener("DOMContentLoaded", () => {
   ar
    let adminLinks = document.querySelectorAll('.admin-link');
    adminLinks.forEach(link => {
        link.style.display = isAdmin() ? 'block' : 'none';
    });

    
    let adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.style.display = isAdmin() ? 'block' : 'none';
    });

    let path = window.location.pathname.split("/").pop();
    if (path === "admins.html" && !isAdmin()) {
        alert("Acesso negado! Apenas administradores podem aceder a esta página.");
        window.location.href = "inicio.html";
        return;
    }
});


function addAdminNavLink() {
    let navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;


    let existingLink = navLinks.querySelector('.admin-link');
    if (existingLink) return;


    let adminLink = document.createElement('a');
    adminLink.href = 'admins.html';
    adminLink.className = 'admin-link';
    adminLink.textContent = 'Gestão de Utilizadores';
    adminLink.style.display = isAdmin() ? 'block' : 'none';

    navLinks.appendChild(adminLink);
}
if (typeof isAdmin !== 'undefined') {
    addAdminNavLink();
} else {
    setTimeout(() => {
        if (typeof isAdmin !== 'undefined') {
            addAdminNavLink();
        }
    }, 100);
}
