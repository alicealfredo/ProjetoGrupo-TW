

function getFromStorage(key, defaultValue = []) {
  let data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Dados  receitas
let recipes = getFromStorage('recipes', [
  { id: 1, name: "Arroz do mar", time: 10, difficulty: "Fácil", genre: "Marisco", instructions: "Cozinhar o arroz com marisco fresco...", chef: "Marta Silva", image: "./imagens/experimentação.png", likes: 0 },
  { id: 2, name: "Bacalhau com broa", time: 45, difficulty: "Médio", genre: "Peixe", instructions: "Cobrir o bacalhau com broa ralada...", chef: "João Costa", image: "./imagens/bacalhau broa.png", likes: 0 },
  { id: 3, name: "Arroz de pato", time: 60, difficulty: "Médio", genre: "Carne", instructions: "Preparar o pato e misturar com arroz...", chef: "João Costa", image: "./imagens/Arroz.png", likes: 0 },

]);

let users = getFromStorage('users', []);
let currentUser = getFromStorage('currentUser', null);

function isLoggedIn() {
  if (!currentUser) {
    alert("Precisas de fazer login primeiro!");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  saveToStorage('currentUser', null);
  currentUser = null;
  window.location.href = "login.html";
}

function isAdmin() {
  return currentUser && currentUser.email === "admin@gmail.com" && currentUser.password === "admin";
}

window.getFromStorage = getFromStorage;
window.saveToStorage = saveToStorage;
window.recipes = recipes;
window.users = users;
window.currentUser = currentUser;
window.isLoggedIn = isLoggedIn;
window.logout = logout;
window.isAdmin = isAdmin;
