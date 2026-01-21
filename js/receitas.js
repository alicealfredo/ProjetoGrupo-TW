

function renderRecipes(filtered) {
  let container = document.querySelector(".cards");
  if (!container) {
    console.error("Container .cards não encontrado");
    return;
  }

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-center py-5">Nenhuma receita encontrada...</p>';
    return;
  }

  filtered.forEach(recipe => {
    let card = document.createElement("div");
    card.className = "recipe-item";
    card.innerHTML = `
      <div class="recipe-image">
        <img src="${recipe.image}" alt="${recipe.name}">
      </div>
      <div class="recipe-card">
        <h3>${recipe.name}</h3>
        <div class="meta">
          <span>⏱ ${recipe.time} min</span>
          <span class="difficulty">
            <img src="../imagens/chapeu.png" alt="${recipe.difficulty}">
            <span>${recipe.difficulty}</span>
          </span>
        </div>
        <div class="card-actions">
          <button class="icon-btn save-btn" data-id="${recipe.id}">
            <img src="../imagens/save.png" alt="Guardar">
          </button>
          <button class="icon-btn like-btn" data-id="${recipe.id}">
            ${getLikeIcon(recipe.id)} ${recipe.likes || 0}
          </button>
        </div>
        <button class="btn btn-outline-primary btn-sm view-recipe mt-2" data-id="${recipe.id}">
          Ver receita
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  attachCardEvents();
}

function getLikeIcon(recipeId) {
  if (!isLoggedIn()) return "♡";
  return currentUser.likedRecipes?.includes(recipeId) ? "❤️" : "♡";
}

function attachCardEvents() {
 
  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      let id = parseInt(e.currentTarget.dataset.id);
      if (!isLoggedIn()) return;

      if (!currentUser.favorites.includes(id)) {
        currentUser.favorites.push(id);
        saveToStorage("currentUser", currentUser);
        saveToStorage("users", users.map(u => u.id === currentUser.id ? currentUser : u));
        alert("Receita guardada nos favoritos!");
      }
    });
  });


  document.querySelectorAll(".like-btn").forEach(btn => {
    let recipeId = parseInt(btn.dataset.id);
    let recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    btn.addEventListener("click", () => {
      if (!isLoggedIn()) {
        alert("Precisas de estar logado para dar like!");
        return;
      }

      if (!currentUser.likedRecipes) currentUser.likedRecipes = [];

      let alreadyLiked = currentUser.likedRecipes.includes(recipeId);

      if (alreadyLiked) {
        recipe.likes = Math.max(0, (recipe.likes || 0) - 1);
        currentUser.likedRecipes = currentUser.likedRecipes.filter(id => id !== recipeId);
        btn.innerHTML = `♡ ${recipe.likes}`;
      } else {
        recipe.likes = (recipe.likes || 0) + 1;
        currentUser.likedRecipes.push(recipeId);
        if (recipe.genre && !currentUser.likes.includes(recipe.genre)) {
          currentUser.likes.push(recipe.genre);
        }
        btn.innerHTML = `❤️ ${recipe.likes}`;
      }

      saveToStorage("recipes", recipes);
      saveToStorage("currentUser", currentUser);
      saveToStorage("users", users.map(u => u.id === currentUser.id ? currentUser : u));
    });
  });

 
  document.querySelectorAll(".view-recipe").forEach(btn => {
    btn.addEventListener("click", e => {
      let id = parseInt(e.currentTarget.dataset.id);
      let recipe = recipes.find(r => r.id === id);
      if (!recipe) return;

      document.getElementById("modalRecipeName").textContent = recipe.name;
      document.getElementById("modalRecipeTime").textContent = recipe.time;
      document.getElementById("modalRecipeDifficulty").textContent = recipe.difficulty;
      document.getElementById("modalRecipeGenre").textContent = recipe.genre || "—";
      document.getElementById("modalRecipeInstructions").textContent = 
        recipe.instructions || "Sem instruções detalhadas.";
      document.getElementById("modalRecipeChef").textContent = recipe.chef || "Utilizador";

      let img = document.getElementById("modalRecipeImage");
      img.src = recipe.image || "./imagens/placeholder.jpg";
      img.onerror = () => img.src = "./imagens/placeholder.jpg";

      // Mostrar botão remover apenas para admin
      let deleteBtn = document.getElementById("btnDeleteRecipe");
      if (deleteBtn) {
        deleteBtn.style.display = isAdmin() ? "inline-block" : "none";
        deleteBtn.onclick = () => deleteRecipe(id);
      }

      let modal = new bootstrap.Modal(document.getElementById("recipeDetailModal"));
      modal.show();
    });
  });
}

function deleteRecipe(recipeId) {
  if (!isAdmin()) {
    alert("Apenas administradores podem remover receitas!");
    return;
  }

  let recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  if (confirm(`Tem certeza que deseja remover a receita "${recipe.name}"?`)) {
    recipes = recipes.filter(r => r.id !== recipeId);
    saveToStorage("recipes", recipes);

    
    users.forEach(user => {
      if (user.favorites) {
        user.favorites = user.favorites.filter(id => id !== recipeId);
      }
      if (user.likedRecipes) {
        user.likedRecipes = user.likedRecipes.filter(id => id !== recipeId);
      }
    });
    saveToStorage("users", users);

    
    if (currentUser && currentUser.favorites) {
      currentUser.favorites = currentUser.favorites.filter(id => id !== recipeId);
    }
    if (currentUser && currentUser.likedRecipes) {
      currentUser.likedRecipes = currentUser.likedRecipes.filter(id => id !== recipeId);
    }
    saveToStorage("currentUser", currentUser);

    bootstrap.Modal.getInstance(document.getElementById("recipeDetailModal"))?.hide();
    alert(`Receita "${recipe.name}" removida com sucesso!`);
    
    // Recarregar a lista de receitas
    let filtersSection = document.querySelector('.filters');
    if (filtersSection) {
      let event = new Event('change');
      filtersSection.querySelectorAll('select')[0].dispatchEvent(event);
    }
  }
}

function populateChefSelect() {
  let select = document.getElementById("recipeChef");
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um chef...</option>';

  let chefs = new Set(recipes.map(r => r.chef || "Utilizador"));
  [...chefs].sort().forEach(chef => {
    let option = document.createElement("option");
    option.value = chef;
    option.textContent = chef;
    select.appendChild(option);
  });


  select.value = currentUser?.name?.trim() || "Utilizador";
}

document.addEventListener("DOMContentLoaded", () => {

  let addRecipeWrapper = document.getElementById("addRecipeWrapper");
  if (addRecipeWrapper && isAdmin()) {
    addRecipeWrapper.style.display = "block";
  }

  let filtersSection = document.querySelector('.filters');
  if (!filtersSection) return;

  let selects = filtersSection.querySelectorAll('select');
  let timeFilter = selects[0];
  let diffFilter = selects[1];
  let orderFilter = selects[2];
  let searchInput = document.querySelector('.search input[type="search"]');
  let clearBtn = document.querySelector(".btn-clear");

  function applyFilters() {
    let filtered = [...recipes];

    if (timeFilter.value !== "Qualquer") {
      let max = parseInt(timeFilter.value.split(" ")[1]) || Infinity;
      filtered = filtered.filter(r => r.time <= max);
    }

    if (diffFilter.value !== "Qualquer") {
      filtered = filtered.filter(r => r.difficulty === diffFilter.value);
    }

    if (currentUser && currentUser.likes?.length > 0) {
      filtered.sort((a, b) => {
        let aPref = currentUser.likes.includes(a.genre) ? -1 : 1;
        let bPref = currentUser.likes.includes(b.genre) ? -1 : 1;
        return aPref - bPref;
      });
    }

    if (orderFilter.value === "Mais rápidas") {
      filtered.sort((a, b) => a.time - b.time);
    } else if (orderFilter.value === "Mais popular") {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    let term = searchInput?.value?.toLowerCase()?.trim() || "";
    if (term) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(term));
    }

    renderRecipes(filtered);
  }

  timeFilter.addEventListener("change", applyFilters);
  diffFilter.addEventListener("change", applyFilters);
  orderFilter.addEventListener("change", applyFilters);
  if (searchInput) searchInput.addEventListener("input", applyFilters);

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      timeFilter.value = "Qualquer";
      diffFilter.value = "Qualquer";
      orderFilter.value = "Mais recentes";
      if (searchInput) searchInput.value = "";
      applyFilters();
    });
  }

  
  let addBtn = document.getElementById("btnOpenAddRecipeModal");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (!isLoggedIn()) {
        alert("Precisas de estar logado para adicionar receitas!");
        return;
      }

      let form = document.getElementById("addRecipeForm");
      if (form) form.reset();

      populateChefSelect(); // Preenche o select de chefs

      let modal = new bootstrap.Modal(document.getElementById("addRecipeModal"));
      modal.show();
    });
  }

  
  let submitBtn = document.getElementById("btnSubmitRecipe");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      let form = document.getElementById("addRecipeForm");
      if (!form?.checkValidity()) {
        form.reportValidity();
        return;
      }

      let newChefInput = document.getElementById("newChefName")?.value.trim();
      let selectedChef = document.getElementById("recipeChef").value;

      let finalChef = newChefInput || selectedChef || "Utilizador";

      let newRecipe = {
        id: recipes.length + 1,
        name: document.getElementById("recipeName").value.trim(),
        time: parseInt(document.getElementById("recipeTime").value),
        difficulty: document.getElementById("recipeDifficulty").value,
        genre: document.getElementById("recipeGenre").value.trim() || "Outros",
        instructions: document.getElementById("recipeInstructions").value.trim(),
        chef: finalChef,
        image: document.getElementById("recipeImage").value.trim() || "./imagens/placeholder.jpg",
        likes: 0
      };

      recipes.push(newRecipe);
      saveToStorage("recipes", recipes);

      bootstrap.Modal.getInstance(document.getElementById("addRecipeModal"))?.hide();
      alert(`Receita "${newRecipe.name}" adicionada com sucesso!`);
      applyFilters();
    });
  }


  applyFilters();
});