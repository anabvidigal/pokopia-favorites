let allData = [];
let uniqueFavorites = [];

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
    const table = document.createElement('table');

    // Create header row
    const headerRow = document.createElement('tr');
    const headers = ['Name', 'Description', 'Category', 'Favorites'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create data rows
    data.forEach(item => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.description;
        row.appendChild(descriptionCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.category;
        row.appendChild(categoryCell);

        const favoritesCell = document.createElement('td');
        favoritesCell.textContent = item.favorites;
        row.appendChild(favoritesCell);

        table.appendChild(row);
    });

    resultsDiv.appendChild(table);
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
    }
    );
    uniqueFavorites.sort()
}

function renderFilters(favorites) {
    const filtersDiv = document.getElementById("filters");

    favorites.forEach(favorite => {
        const button = document.createElement('button');
        button.textContent = favorite;
        button.value = favorite;
        button.classList.add('filter-btn');
        button.classList.add('off');  // Start as off

        button.addEventListener('click', (e) => {
            e.preventDefault();
            button.classList.toggle('off');
            button.classList.toggle('on');
            filterAndRender();
        });

        filtersDiv.appendChild(button);
    });
}

function filterAndRender() {
    const activeButtons = document.querySelectorAll('.filter-btn.on');
    const activeTraits = Array.from(activeButtons).map(btn => btn.value);
    
    let itemsToRender;
    
    if (activeTraits.length === 0) {
        itemsToRender = allData;
    } else {
        itemsToRender = allData.filter(item => 
            activeTraits.every(trait => item.favorites.includes(trait))
        );
    }
    
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ''; // Clear previous results
    renderItems(itemsToRender);
}

fetchData()