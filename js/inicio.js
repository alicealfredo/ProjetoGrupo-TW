//Slideshow
document.addEventListener("DOMContentLoaded", () => {
  
  let carouselInner = document.querySelector("#heroCarousel .carousel-inner");
  if (carouselInner) {
    carouselInner.innerHTML = "";

    let lastThree = recipes.slice(-3).reverse();

    lastThree.forEach((recipe, index) => {
      let item = document.createElement("div");
      item.className = `carousel-item ${index === 0 ? "active" : ""}`;
      item.innerHTML = `<img src="${recipe.image}" alt="${recipe.name}" class="d-block w-100">`;
      carouselInner.appendChild(item);
    });
  }

  // Chges que tem mais receitas
  let chefCounts = {};
  recipes.forEach(r => {
    chefCounts[r.chef] = (chefCounts[r.chef] || 0) + 1;
  });

  let sortedChefs = Object.entries(chefCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  let chefsRow = document.querySelector(".chefs-row");
  if (chefsRow) {
    chefsRow.innerHTML = "";

    sortedChefs.forEach(chefName => {
      let chef = [
        { name: "Marta Silva", specialty: "Saudável & Rápido", image: "imagens/111.png" },
        { name: "João Costa", specialty: "Cozinha Portuguesa", image: "imagens/1204.png" },
        { name: "Ana Rocha", specialty: "Sobremesas", image: "imagens/ultima.png" },
        { name: "Ricardo Lopes", specialty: "Grelhados & Carnes", image: "imagens/fim.png" }
      ].find(c => c.name === chefName);

      if (chef) {
        let div = document.createElement("div");
        div.className = "chef-item";
        div.innerHTML = `
          <img src="${chef.image}" alt="${chef.name}">
          <h3>${chef.name}</h3>
          <span>${chef.specialty}</span>
        `;
        chefsRow.appendChild(div);
      }
    });
  }
});