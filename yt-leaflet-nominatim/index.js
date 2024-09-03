const startInput = document.getElementById('start-location');
const startResults = document.getElementById('start-results');
const endInput = document.getElementById('end-location');
const endResults = document.getElementById('end-results');
const mapContainer = document.getElementById('map-container');
let startMarker, endMarker;
let startWaypoint, endWaypoint;

const map = L.map(mapContainer).setView([20.13847, 1.40625], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const routingControl = L.Routing.control({
    waypoints: [],
    router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
    }),
    createMarker: function() { return null; } // Disable default markers
}).addTo(map);

startInput.addEventListener('input', () => searchLocation(startInput.value, 'start'));
endInput.addEventListener('input', () => searchLocation(endInput.value, 'end'));

function searchLocation(query, type) {
    if (query.length < 3) {
        return; // Don't search for short queries
    }
    
    fetch('https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=' + query)
        .then(result => result.json())
        .then(parsedResult => {
            if (type === 'start') {
                showResults(parsedResult, startResults, 'start');
            } else if (type === 'end') {
                showResults(parsedResult, endResults, 'end');
            }
        });
}

function showResults(parsedResult, resultsElement, type) {
    resultsElement.innerHTML = '';
    parsedResult.forEach(location => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'list-group-item-action');
        li.textContent = location.display_name;
        li.addEventListener('click', () => selectLocation(location, type));
        resultsElement.appendChild(li);
    });
}

function selectLocation(location, type) {
    const position = new L.LatLng(location.lat, location.lon);

    if (type === 'start') {
        if (startMarker) {
            map.removeLayer(startMarker);
        }
        startMarker = L.marker(position).addTo(map);
        startWaypoint = position;
        startInput.value = location.display_name;
        startResults.innerHTML = '';
    } else if (type === 'end') {
        if (endMarker) {
            map.removeLayer(endMarker);
        }
        endMarker = L.marker(position).addTo(map);
        endWaypoint = position;
        endInput.value = location.display_name;
        endResults.innerHTML = '';
    }

    map.flyTo(position, 10);
    updateRoute();
}

function updateRoute() {
    if (startWaypoint && endWaypoint) {
        routingControl.setWaypoints([startWaypoint, endWaypoint]);
    }
}
