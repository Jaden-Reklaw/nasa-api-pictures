// Select DOM elements
const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const loader = document.querySelector('.loader');


// NASA API
const count = 2;
const apiKey = 'DEMO_KEY';
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultArray = [];
let favorites = {};

const showContent = (page) => {
    //Force to top of page when user clicks on load more
    window.scrollTo({top: 0, behavior: 'instant'});
    if(page === 'results') {
        resultsNav.classList.remove('hidden');
        favoritesNav.classList.add('hidden');
    } else {
        resultsNav.classList.add('hidden');
        favoritesNav.classList.remove('hidden');
    }
    loader.classList.add('hidden');
}

// Render DOM based on page arg and then create elements for cards
const createDOMNodes = (page) => {
    const currentArray = page === 'results' ? resultArray : Object.values(favorites);
    currentArray.forEach((result) => {
        // Card Container
        const card = document.createElement('div');
        card.classList.add('card');
        // Link
        const link = document.createElement('a');
        link.href = result.hdurl;
        link.title = `${result.title}. Click to View Full Image!`;
        link.target = '_blank';
        // Image
        const image = document.createElement('img');
        image.src = result.url;
        image.alt = result.title;
        image.loading = 'lazy'; //Loads images as needed not all at once
        image.classList.add('card-img-top');
        // Card Body
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        // Card Title
        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = result.title;
        // Save Text
        const saveText = document.createElement('p');
        saveText.classList.add('clickable');
        if(page === 'results') {
            saveText.textContent = 'Add to Favorites';
            saveText.setAttribute('onclick', `saveFavorite('${result.url}')`);
        } else {
            saveText.textContent = 'Remove from Favorites';
            saveText.setAttribute('onclick', `removeFavorite('${result.url}')`);
        }
        // Card Text
        const cardText = document.createElement('p');
        cardText.textContent = result.explanation;
        // Footer Container
        const footer = document.createElement('small');
        footer.classList.add('text-muted');
        // Date
        const date = document.createElement('strong');
        date.textContent = result.date;
        // Copyright
        const copyrightResult = result.copyright === undefined ? '' : result.copyright;
        const copyright = document.createElement('span');
        copyright.textContent = ` ${copyrightResult}`;
        //Append items to their proper parents
        footer.append(date, copyright);
        cardBody.append(cardTitle, saveText, cardText, footer);
        link.appendChild(image);
        card.append(link, cardBody);
        imagesContainer.appendChild(card);
    });
}

// Update the DOM with NASA Cards if favorites in local storage
const updateDOM = (page) => {
    // Get Favorites from local storage
    if(localStorage.getItem('nasaFavorites')) {
        favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
    }
    //Empty image container each time so the elements get refreshed
    imagesContainer.textContent = '';
    createDOMNodes(page);
    // Remove loader here
    showContent(page);
}

// Get 10 images from NASA API
const getNasaPictures = async () => {
    // Show loader
    loader.classList.remove('hidden');
    try {
        const respone = await fetch(apiUrl);
        resultArray = await respone.json();
        updateDOM('results');
    } catch(error) {
        console.log(error);
    }
}

// Add result to Favorites
const saveFavorite = (itemUrl) => {
    resultArray.forEach((item) => {
        if(item.url.includes(itemUrl) && !favorites[itemUrl]) {
            // create an object to add to favorites object
            favorites[itemUrl] = item;
            // Show save confirmation for 2 seconds then disappear
            saveConfirmed.hidden = false;
            setTimeout(() => {
                saveConfirmed.hidden = true;
            }, 2000);
            // Set Favorites in localStorage
            localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
        }
    });
}

// Remove card from Favorites
const removeFavorite = (itemUrl) => {
    //if key exist delete item
    if(favorites[itemUrl]) {
        delete favorites[itemUrl];
    }
    // Update local storage with current favorites
    localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    //Update the DOM with favorites again
    updateDOM('favorites');
}

// On load
getNasaPictures();