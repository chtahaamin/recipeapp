document.addEventListener("DOMContentLoaded", initializeApp);

const apiKey = "93a4b74306a74ca090e249b327887b5e";
const numberOfRecipes = 12;

function initializeApp() {
  const mealCard = document.getElementById("cards");
  const recipeCloseBtn = document.getElementById("recipe-close-btn");
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  

  searchBtn.addEventListener("click", getMealList);
  searchInput.addEventListener("keypress", (pressed) => {
    if (pressed.key === "Enter") {getMealList();}});
  mealCard.addEventListener("click", getMealRecipe);
  recipeCloseBtn.addEventListener("click", closeRecipeDetail);
  const allDishes = localStorage.getItem('allDishes');
  if (allDishes) {
    displayMeals(JSON.parse(allDishes));
  } else {
    fetchAllDishes();
  }
}

function fetchAllDishes() {
  fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=${numberOfRecipes}`)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("allDishes", JSON.stringify(data.recipes));
      displayMeals(data.recipes);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function getMealList() {
  const searchInputValue = document.getElementById("search-input").value.trim().toLowerCase();
  const mealCard = document.getElementById("cards");

  if (searchInputValue === "") {
    const allDishes = localStorage.getItem('allDishes');
    if (allDishes) {
      displayMeals(JSON.parse(allDishes));
    } else {
      fetchAllDishes();
    }
    return;
  }

  const locallyStoredData = localStorage.getItem(searchInputValue);
  if (locallyStoredData) {
    displayMeals(JSON.parse(locallyStoredData));
  } else {
    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${searchInputValue}&apiKey=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          localStorage.setItem(searchInputValue, JSON.stringify(data.results));
          displayMeals(data.results);
        } else {
          mealCard.innerHTML = `<p class="notFound">Sorry, we do not have a recipe for "${searchInputValue}"</p>`;
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
}

function displayMeals(data) {
  const mealCard = document.getElementById("cards");
  let html = "";
      data.forEach((meal) => {
        html += `
          <div class="card_main" data-id="${meal.id}">
            <img src="${meal.image}" class="cardimage" alt="${meal.title}">
            <p class="meal-name">${meal.title}</p>
            <a href="#" class="recipe-btn">Get Recipe</a>
          </div>
        `;
      });

  mealCard.innerHTML = html;
  mealCard.classList.remove("notFound");
}

function getMealRecipe(e) {
  e.preventDefault();
  if (e.target.classList.contains("recipe-btn")) {
    const mealItem = e.target.parentElement;
    const mealId = mealItem.dataset.id;

    const storedData = localStorage.getItem(`meal_${mealId}`);
    if (storedData) {
      displayMealDetail(JSON.parse(storedData));
    } else {
      fetch(`https://api.spoonacular.com/recipes/${mealId}/information?apiKey=${apiKey}`)
        .then((response) => response.json())
        .then((meal) => {
          localStorage.setItem(`meal_${mealId}`, JSON.stringify(meal));
          displayMealDetail(meal);
        })
        .catch((error) => {
          console.error("Error fetching recipe details:", error);
        });
    }
  }
}

function displayMealDetail(meal) {
  const mealDetailContent = document.querySelector(".meal-detail-content");

  mealDetailContent.innerHTML = `
    <h2 class="recipe-title">${meal.title}</h2>
    <h3>ingredients:</h3>
    <p class="recipe-category">${meal.extendedIngredients.map((value) => value.original).join(", ")}</p>
    <div class="recipe-instruction">
      <h3>Instructions:</h3>
      <p>${meal.instructions}</p>
    </div>
    <div class="recipe-meal-img">
      <img src="${meal.image}" alt="${meal.title}">
    </div>
    <div class="recipe-link">
      <a href="${meal.sourceUrl}" target="_blank">Read More</a>
    </div>
  `;

  document.querySelector(".meal-detail").style.display = "block";
}

function closeRecipeDetail() {
  document.querySelector(".meal-detail").style.display = "none";
}
