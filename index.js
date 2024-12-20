import { mapRawCocktailData } from "./utilities.js";

const detailsPage = document.querySelector("#details-page");
const navbar = document.querySelector(".navbar");
const newRandomDrinkBtn = document.querySelector("#btn-new-cocktail");
const randomCocktailContainer = document.querySelector(".randomCocktailContainer");
const searchForm = document.querySelector("form");
const searchList = document.querySelector(".searchList");
const searchPage = document.querySelector("#search-page");
const seeMoreButton = document.querySelector("#btn-see-more");
const searchInput = document.querySelector("#search-input");
const startPage = document.querySelector("#start-page");

let currentCocktailId = null;// Fick lägga till en global variabel för att nuvarande drink ska sparas på den annars blev det tokigt.

//############### NAVBAR ####################

function handleOnNavbarClick(event) {  //Funktion för att hantera klick i navbar 
  const classList = event.target.classList;
  if (classList.contains("link")) return handleOnLinkClick(event.target.id);
};



function handleOnLinkClick(id) { // Hanterar klick i navbaren
  if (id === "start-link") {
    startPage.classList.add("open");
    detailsPage.classList.remove("open");
    searchPage.classList.remove("open");

  }

  if (id === "search-link") {
    startPage.classList.remove("open");
    detailsPage.classList.remove("open");
    searchPage.classList.add("open");

    clearSearchResult(); // Aktiveras när sök länken klickas på
  }

  if (id === "favorite-link") {
    startPage.classList.remove("open");
    detailsPage.classList.remove("open");
    searchPage.classList.remove("open");
    
  }
};



function handleCocktailListClick(event) { // Hanterar klick i listan på söksidan
  const cocktailElement = event.target.closest(".cocktailList"); 

  if (cocktailElement) { //Om listelementet klickas på öppnas detaljsida med aktuellt drinkid.
    const drinkId = cocktailElement.id; 
    getCocktailDetails(drinkId); 
    startPage.classList.remove("open");
    detailsPage.classList.add("open");
    searchPage.classList.remove("open");
    
  }
};

function clearSearchResult(){ // Tömmer sökresultatet.
    searchList.innerHTML = "";
};


function handleSeeMoreBtn() { // Hanterar klick på "see more" knappen
        if (currentCocktailId) { // Om det är sparade id på globalvariabel öppnas detaljsidan med aktuell variabel
          getCocktailDetails(currentCocktailId); 
  
          startPage.classList.remove("open");
          detailsPage.classList.add("open");
          searchPage.classList.remove("open");
        }
      };

// #################### FÖRSTA SIDAN, RANDOM DRINK ######################

function createRandomCocktail(cocktail) {  // Skapar html strukturen av en random drink på första sidan.
  
  randomCocktailContainer.innerHTML = /*html*/ `
    <article class="randomCocktail" id="${cocktail.id}">
      <h3 class="drinkName">${cocktail.name}</h3>
        <img class="randomCocktailImg" src="${cocktail.thumbnail}" alt="${cocktail.name}"> 
    </article>`;

     currentCocktailId = cocktail.id; // Global variabel uppdateras till aktuell random drink
    
};


async function getRandomCocktail() { // Hämtar API till random drink på första sidan.
  try {
    const URLRandom = `https://www.thecocktaildb.com/api/json/v1/1/random.php`;
    const res = await fetch(URLRandom);
    const data = await res.json(); // Konverterar datan till JSON.
    
    const randomCocktailData= data.drinks[0] // Hämtar datan till drinken och börjar på den först i arrayen.
   


    const cocktailData = mapRawCocktailData(randomCocktailData); // Omvandlar den råa datan i randomCocktailData till mer användbar data i och sparar i variablen cocktailData.
    const randomCocktailId= createRandomCocktail(cocktailData); // Skapar html doc med den aktuella drinken med den omvanlade datan från API.

    seeMoreButton.addEventListener("click", () => handleSeeMoreBtn(randomCocktailId)); // Hanterar klick på "see more" knappen och visar detaljsida med mer info

  } catch (error) {
    console.error("Error", error);// Visar error meddelande i konsolen.
  }
};



// #################### SÖKSIDAN, LISTA PÅ DRINKAR ######################

function cocktailSearchList(cocktails) { // Skapar html strukturen
  searchList.innerHTML = ""; // Rensar användarens tidigare söklista

  if(cocktails.length > 0){ // If sats som kontrollerrar om drinklistan är större än noll.
    cocktails.forEach((cocktail) => { // Listar varje drink från listan enskilt.
      const cocktailElement = document.createElement("li");
      cocktailElement.classList.add("cocktailList"); 
      cocktailElement.id = cocktail.id; 
      cocktailElement.innerHTML = /*html*/ `
        <h3>${cocktail.name}</h3>
      `;

      searchList.appendChild(cocktailElement); // Lägger till html doc i söklistan
      
    });
    }; 
};



async function searchByCocktailName() { // Hämtar API till drink på sök sidan. 
   
  const cocktailName = searchInput.value.trim(); // Lagrar användarens input från sök dokumentet och tar bort överflödiga mellanslag.

  if (!cocktailName) return;
  const URLSearch = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`;

  try {
    const res = await fetch(URLSearch);
    const data = await res.json();

    if (data.drinks) { // Om den är sann så mappas den råa datan och sedan omvandlas resultatet till söklistan
      const searchData = data.drinks.map(mapRawCocktailData); 
      cocktailSearchList(searchData);  
      
    } else {
      searchList.innerHTML = "<p>No cocktails found</p>"; // Uppdaterar listan om det inte finns några drinkar.
    }

    searchInput.value = ""; // Tömmer inputfält efter varje sökning.

  } catch (error) {
    console.error("Error", error); // Fångar error
  }
};



// #################### DETALJSIDAN, VISA DRINKAR MED FLER DETALJER ##############

function createDetailsCocktail(cocktail) { // Skapar html strukturen på detaljsidan
  const cocktailDetailsContainer = document.querySelector(".detailsContainer");
  cocktailDetailsContainer.innerHTML = /*html*/ `
    <article class="aboutDrink">
    <div class="aboutDrinkSection">
      <h1 class="drinkName">${cocktail.name}</h1>
        <img class="detailsCocktailImg" src="${cocktail.thumbnail}">
      <p class="category">${cocktail.category}</p>
      <p class ="tags">${cocktail.tags.join(", ")}</p>
      </div>
     <div class="ingredientContainer">
      <div class="ingredient">
        <ul>${cocktail.ingredients.map(ingredient =>
          `<li>${ingredient.ingredient}: ${ingredient.measure}</li>`
        ).join(" ")}
        </ul>
      </div>
      <article class="instructions">${cocktail.instructions}</article>
      <p>${cocktail.glass}</p>
      </div>
    </article>`;
};


async function getCocktailDetails(cocktailId) { // Hämtar API för detaljsidan
  try {
    const URLDetails = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`;
    const res = await fetch(URLDetails);
    const data = await res.json();
    const drinkDetails = data.drinks[0]; // Hämtar datan till drinken och börjar på den första i arrayen.

    const cocktailDetailsData = mapRawCocktailData(drinkDetails); // Omvandlar den råa datan till mer användbar data.
    createDetailsCocktail(cocktailDetailsData); // Skapar html dokument med detaljdatan
  } catch (error) {
    console.error("Error", error);
  }
};




//#################### EVENTLYSSNARE ##########################

document.addEventListener("DOMContentLoaded", () => { // Triggas när hela sidan laddats pch säkerställer att html dokumentet laddats först
  getRandomCocktail(); // Genererar en random cocktail på start sidan


navbar.addEventListener("click", handleOnNavbarClick); // Lyssnar efter klick på navbaren

newRandomDrinkBtn.addEventListener("click", getRandomCocktail); // Lyssnar efter knapptryck på "new cocktail".

seeMoreButton.addEventListener("click", handleSeeMoreBtn);

searchForm.addEventListener('submit', (event) => { // Submitar sökformuläret och aktiverar 
    event.preventDefault();
    searchByCocktailName();
  });

searchList.addEventListener("click", handleCocktailListClick); // Lyssnar efter klick i söklistan 
});









