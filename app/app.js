let allData = [];
let uniqueFavorites = [];
let activeFavorites = [];

function fetchData(){
    return fetch('./data/favorites.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        allData = data;
        populateFavorites(allData);
        renderFilters(uniqueFavorites);
        renderItems(allData);
    })
    .catch(error => console.error('Fetch error:', error));
}

function renderItems(data) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ''; // Clear previous results
    const grid = document.createElement('div');
    grid.classList.add('card-grid');

    data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');

        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('card-image');
        
        if (item.image) {
            // Check if image exists before displaying
            const img = new Image();
            img.onload = function() {
                // Image exists, show it
                const displayImg = document.createElement('img');
                displayImg.src = `assets/${item.image}`;
                displayImg.alt = item.name;
                imageWrapper.appendChild(displayImg);
            };
            img.onerror = function() {
                // Image doesn't exist, show placeholder
                const placeholder = document.createElement('div');
                placeholder.classList.add('image-placeholder');
                placeholder.textContent = 'No image available';
                imageWrapper.appendChild(placeholder);
            };
            img.src = `assets/${item.image}`;
        } else {
            const placeholder = document.createElement('div');
            placeholder.classList.add('image-placeholder');
            placeholder.textContent = 'No image available';
            imageWrapper.appendChild(placeholder);
        }
        card.appendChild(imageWrapper);

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');

        const title = document.createElement('h2');
        title.classList.add('card-title');
        title.textContent = item.name;
        cardHeader.appendChild(title);

        const categoryTag = document.createElement('span');
        categoryTag.classList.add('pill', 'category-pill');
        categoryTag.textContent = item.category;
        cardHeader.appendChild(categoryTag);

        card.appendChild(cardHeader);

        const description = document.createElement('p');
        description.classList.add('card-description');
        description.textContent = item.description;
        card.appendChild(description);

        const tagList = document.createElement('div');
        tagList.classList.add('tag-list');
        const favorites = Array.isArray(item.favorites) ? item.favorites : [item.favorites];

        favorites.forEach(favorite => {
            const tag = document.createElement('span');
            tag.classList.add('pill', 'favorite-pill');
            tag.textContent = favorite;
            tagList.appendChild(tag);
        });

        card.appendChild(tagList);
        grid.appendChild(card);
    });

    resultsDiv.appendChild(grid);
}

function populateFavorites(data) {
    data.forEach(item => {
        const favorites = Array.isArray(item.favorites)
        ? item.favorites
        : [item.favorites];

        favorites.forEach(favorite => {
            if (!uniqueFavorites.includes(favorite)) {
                uniqueFavorites.push(favorite);
            }
        });
    });
    uniqueFavorites.sort();
}

function getCompatibleFavorites(activeFavsList) {
    if (activeFavsList.length === 0) {
        return uniqueFavorites;
    }

    // Find all items that match ALL currently active favorites
    const matchingItems = allData.filter(item => {
        const favorites = Array.isArray(item.favorites) ? item.favorites : [item.favorites];
        return activeFavsList.every(active => favorites.includes(active));
    });

    // Find all favorites that appear in those matching items
    const compatible = new Set();
    matchingItems.forEach(item => {
        const favorites = Array.isArray(item.favorites) ? item.favorites : [item.favorites];
        favorites.forEach(fav => compatible.add(fav));
    });

    return Array.from(compatible);
}

function getFilteredItems() {
    if (activeFavorites.length === 0) {
        return allData;
    }

    return allData.filter(item => {
        const favorites = Array.isArray(item.favorites) ? item.favorites : [item.favorites];
        return activeFavorites.every(active => favorites.includes(active));
    });
}

function renderFilters(favorites) {
    const filtersDiv = document.getElementById("filters");
    filtersDiv.innerHTML = '';

    const tagsContainer = document.createElement('div');
    tagsContainer.classList.add('filter-tags');

    // Get favorites compatible with ALL currently active favorites
    const compatibleFavorites = getCompatibleFavorites(activeFavorites);

    favorites.forEach(favorite => {
        const isActive = activeFavorites.includes(favorite);
        const isCompatible = compatibleFavorites.includes(favorite);

        const tag = document.createElement('span');
        tag.classList.add('filter-tag');

        if (isActive) {
            tag.classList.add('active');
            tag.textContent = favorite;

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-btn');
            removeBtn.textContent = '×';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                activeFavorites = activeFavorites.filter(f => f !== favorite);
                renderFilters(uniqueFavorites);
                renderItems(getFilteredItems());
            };
            tag.appendChild(removeBtn);
        } else if (!isCompatible && activeFavorites.length > 0) {
            tag.classList.add('disabled');
            tag.textContent = favorite;
        } else {
            tag.classList.add('inactive');
            tag.textContent = favorite;
            tag.onclick = () => {
                activeFavorites.push(favorite);
                renderFilters(uniqueFavorites);
                renderItems(getFilteredItems());
            };
        }

        tagsContainer.appendChild(tag);
    });

    filtersDiv.appendChild(tagsContainer);
}

fetchData();