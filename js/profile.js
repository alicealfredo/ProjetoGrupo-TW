let MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB Máximo

function loadUserProfileImage() {
  let profileImg = document.getElementById('user-profile-img');
  if (!profileImg) return;

  if (currentUser?.profilePicture) {
    profileImg.src = currentUser.profilePicture;
    profileImg.alt = `Foto de ${currentUser.name || 'utilizador'}`;
  } else {
    profileImg.src = "../imagens/logo.png";
    profileImg.alt = "Foto do utilizador";
  }
}

function saveProfilePicture(file) {
  if (!currentUser) {
    alert("Precisas de estar logado para alterar a foto!");
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    alert("Imagem demasiado grande! (máx 1.5MB)");
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert("Seleciona uma imagem válida (jpg, png, etc)");
    return;
  }

  let reader = new FileReader();
  reader.onload = function(e) {
    let base64Image = e.target.result;

    currentUser.profilePicture = base64Image;
    saveToStorage('currentUser', currentUser);

    let updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, profilePicture: base64Image } : u
    );
    saveToStorage('users', updatedUsers);

    document.querySelectorAll('#user-profile-img, #user-profile-img-large').forEach(img => {
      img.src = base64Image;
    });

    alert("Foto atualizada com sucesso!");
  };

  reader.readAsDataURL(file);
}


function loadProfilePageData() {
  if (!currentUser) {
    alert("Precisas de fazer login!");
    window.location.href = "login.html";
    return;
  }

  document.getElementById('user-name-display').textContent = currentUser.name || "Nome não definido";
  document.getElementById('user-email-display').textContent = currentUser.email || "Email não definido";

  let largeImg = document.getElementById('user-profile-img-large');
  if (largeImg && currentUser.profilePicture) {
    largeImg.src = currentUser.profilePicture;
  }
}


function setupProfilePageEvents() {
  // Editar informações
  let editBtn = document.getElementById('edit-profile-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      let newName = prompt("Novo nome:", currentUser.name);
      if (newName?.trim()) currentUser.name = newName.trim();

      let newEmail = prompt("Novo email:", currentUser.email);
      if (newEmail?.trim()) currentUser.email = newEmail.trim();

      saveToStorage('currentUser', currentUser);
      saveToStorage('users', users.map(u => u.id === currentUser.id ? currentUser : u));

      loadProfilePageData();
      alert("Informações atualizadas!");
    });
  }


  let logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm("Terminar sessão?")) {
        logout();
      }
    });
  }

  let pictureInput = document.getElementById('profile-picture-input');
  if (pictureInput) {
    pictureInput.addEventListener('change', e => {
      let file = e.target.files?.[0];
      if (file) saveProfilePicture(file);
    });
  }
}



function renderFavorites() {
  let container = document.getElementById("favorites-container");
  if (!container) return;

  container.innerHTML = "";

  if (!currentUser?.favorites?.length) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <h5>Ainda não tens receitas guardadas</h5>
        <p>Vai à página de Receitas e clica no ícone de guardar!</p>
      </div>
    `;
    return;
  }

  currentUser.favorites.forEach(favId => {
    let recipe = recipes.find(r => r.id === favId);
    if (!recipe) return;

    let col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${recipe.image}" class="card-img-top" alt="${recipe.name}" 
             style="height: 180px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${recipe.name}</h5>
          <div class="meta small mb-3">
            <span>⏱ ${recipe.time} min</span> • 
            <span>${recipe.difficulty}</span>
          </div>
          <div class="mt-auto d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-primary view-favorite" data-id="${recipe.id}">
              Ver receita
            </button>
            <button class="btn btn-sm btn-outline-danger remove-favorite" data-id="${recipe.id}">
              Remover
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);
  });

  
  document.querySelectorAll(".view-favorite").forEach(btn => {
    btn.addEventListener("click", e => {
      let id = parseInt(e.currentTarget.dataset.id);
      let recipe = recipes.find(r => r.id === id);
      if (!recipe) return;

      document.getElementById("modalRecipeName").textContent = recipe.name;
      document.getElementById("modalRecipeTime").textContent = recipe.time;
      document.getElementById("modalRecipeDifficulty").textContent = recipe.difficulty;
      document.getElementById("modalRecipeGenre").textContent = recipe.genre || "—";
      document.getElementById("modalRecipeInstructions").textContent = recipe.instructions || "Sem instruções.";
      document.getElementById("modalRecipeChef").textContent = recipe.chef || "Utilizador";

      let img = document.getElementById("modalRecipeImage");
      img.src = recipe.image || "./imagens/placeholder.jpg";
      img.onerror = () => img.src = "./imagens/placeholder.jpg";

      let modal = new bootstrap.Modal(document.getElementById("recipeDetailModal"));
      modal.show();
    });
  });

 
  document.querySelectorAll(".remove-favorite").forEach(btn => {
    btn.addEventListener("click", e => {
      let id = parseInt(e.currentTarget.dataset.id);
      let recipe = recipes.find(r => r.id === id);
      if (!recipe) return;

      document.getElementById("modalRecipeNameToRemove").textContent = recipe.name;

      let confirmBtn = document.getElementById("confirmRemoveFavorite");
      let tempHandler = () => {
        currentUser.favorites = currentUser.favorites.filter(favId => favId !== id);
        saveToStorage("currentUser", currentUser);
        saveToStorage("users", users.map(u => u.id === currentUser.id ? currentUser : u));
        
        bootstrap.Modal.getInstance(document.getElementById("removeFavoriteModal")).hide();
        renderFavorites();
        alert("Receita removida dos favoritos!");
        confirmBtn.removeEventListener("click", tempHandler);
      };

      confirmBtn.addEventListener("click", tempHandler);

      let modal = new bootstrap.Modal(document.getElementById("removeFavoriteModal"));
      modal.show();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfileImage();

  if (window.location.pathname.includes("utilizador.html")) {
    loadProfilePageData();
    setupProfilePageEvents();
    renderFavorites();  // Mostra as receitas guardadas
  }

  
  let pictureInput = document.getElementById('profile-picture-input');
  if (pictureInput) {
    pictureInput.addEventListener('change', e => {
      let file = e.target.files?.[0];
      if (file) saveProfilePicture(file);
    });
  }
});