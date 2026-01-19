
document.addEventListener("DOMContentLoaded", () => {
  let path = window.location.pathname.split("/").pop();

  if (path === "login.html") {
    let form = document.querySelector(".login-form");
    form.addEventListener("submit", e => {
      e.preventDefault();
      let email = document.getElementById("email").value.trim();
      let password = document.getElementById("password").value;

      let user = users.find(u => u.email === email && u.password === password);
      if (user) {
        currentUser = user;
        saveToStorage("currentUser", currentUser);
        alert(`Bem-vindo de volta, ${user.name}!`);
        window.location.href = "inicio.html";
      } else {
        alert("Credenciais incorretas!");
      }
    });
  }

  if (path === "registo.html") {
    let form = document.querySelector("#register-form");
    form.addEventListener("submit", async e => {
      e.preventDefault();

      let name = document.getElementById("name").value.trim();
      let email = document.getElementById("email").value.trim();
      let password = document.getElementById("password").value;
      let confirm = document.getElementById("confirm").value;
      let pictureInput = document.getElementById("profile-picture");

      if (password !== confirm) return alert("Palavras-passe não coincidem!");
      if (users.some(u => u.email === email)) return alert("Email já registado!");

      let profilePicture = null;

      if (pictureInput.files[0]) {
        let file = pictureInput.files[0];
        if (file.size > 1500000) return alert("Imagem muito grande (máx 1.5MB)!");
        profilePicture = await new Promise(resolve => {
          let reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      let newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        profilePicture,
        favorites: [],
        likes: [],
        plans: {}
      };

      users.push(newUser);
      saveToStorage("users", users);

      alert(`Conta criada, ${name}! Faz login agora.`);
      window.location.href = "login.html";
    });
  }
});