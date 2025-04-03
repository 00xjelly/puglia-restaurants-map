document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map centered on Puglia
    const map = L.map('map').setView([40.7912, 17.1032], 9);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Create a marker cluster group for better performance with many markers
    const markers = L.markerClusterGroup();
    
    // Get unique cities for the filter dropdown
    const cities = [...new Set(restaurants.map(r => r.city))].sort();
    const cityFilter = document.getElementById('city-filter');
    
    // Add city options to the filter
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
    
    // Create a global object to store markers by city
    const markersByCity = {};
    
    // Function to add restaurants to the map and list
    function addRestaurantsToMap(restaurantsToAdd) {
        const listContainer = document.querySelector('.list-container');
        listContainer.innerHTML = '';
        markers.clearLayers();
        
        restaurantsToAdd.forEach((restaurant, index) => {
            // Create marker
            const marker = L.marker(restaurant.coords)
                .bindPopup(`<strong>${restaurant.name}</strong><br>${restaurant.city}`);
            
            // Add marker to the cluster group
            markers.addLayer(marker);
            
            // Add to city markers collection
            if (!markersByCity[restaurant.city]) {
                markersByCity[restaurant.city] = [];
            }
            markersByCity[restaurant.city].push(marker);
            
            // Create list item
            const listItem = document.createElement('div');
            listItem.classList.add('restaurant-item');
            listItem.setAttribute('data-index', index);
            
            const nameElement = document.createElement('div');
            nameElement.classList.add('restaurant-name');
            nameElement.textContent = restaurant.name;
            
            const cityElement = document.createElement('div');
            cityElement.classList.add('restaurant-city');
            cityElement.textContent = restaurant.city;
            
            listItem.appendChild(nameElement);
            listItem.appendChild(cityElement);
            
            // Add click event to center map on restaurant
            listItem.addEventListener('click', () => {
                showRestaurantDetails(restaurant);
                map.setView(restaurant.coords, 15);
                marker.openPopup();
            });
            
            listContainer.appendChild(listItem);
        });
        
        // Add markers to map
        map.addLayer(markers);
    }
    
    // Function to show restaurant details
    function showRestaurantDetails(restaurant) {
        const listView = document.getElementById('restaurant-list');
        const detailsView = document.getElementById('restaurant-details');
        
        // Populate details
        document.getElementById('detail-name').textContent = restaurant.name;
        document.getElementById('detail-city').textContent = restaurant.city;
        document.getElementById('detail-address').textContent = restaurant.address;
        
        // Update directions link
        const directionsLink = document.getElementById('directions-link');
        directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.name + ', ' + restaurant.address)}`;
        
        // Show details view, hide list view
        listView.classList.add('hidden');
        detailsView.classList.remove('hidden');
    }
    
    // Back button event
    document.getElementById('back-to-list').addEventListener('click', () => {
        document.getElementById('restaurant-list').classList.remove('hidden');
        document.getElementById('restaurant-details').classList.add('hidden');
    });
    
    // City filter event
    cityFilter.addEventListener('change', () => {
        const selectedCity = cityFilter.value;
        
        if (selectedCity === 'all') {
            addRestaurantsToMap(restaurants);
        } else {
            const filteredRestaurants = restaurants.filter(r => r.city === selectedCity);
            addRestaurantsToMap(filteredRestaurants);
            
            // Center map on the selected city
            if (filteredRestaurants.length > 0) {
                map.setView(filteredRestaurants[0].coords, 13);
            }
        }
    });
    
    // Reset filter button
    document.getElementById('reset-filter').addEventListener('click', () => {
        cityFilter.value = 'all';
        addRestaurantsToMap(restaurants);
        map.setView([40.7912, 17.1032], 9); // Reset to Puglia view
    });
    
    // Initial load
    addRestaurantsToMap(restaurants);
});
