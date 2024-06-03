var map = L.map('map').setView([23.634501, -102.552784], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

var userMarker;
var userLatLng;
var currentRoute;
var locations = JSON.parse(localStorage.getItem('locationsMap')) || [];
if (locations.length > 0) {
    drawMarkers();
} drawNewLocations();

if (navigator.geolocation) {
    const actualLocation = localStorage.getItem('userLocation');
    if (actualLocation) {
        const loader = document.getElementById('loader-container');
        loader.classList.add('d-none');
        userLatLng = JSON.parse(actualLocation);
        map.setView(userLatLng, 13);
        userMarker = L.marker(userLatLng).addTo(map)
            .bindPopup('Estás aquí')
            .openPopup();
    } else {
        reloadUserPosition();
    }
} else {
    alert('La geolocalización no es compatible con tu navegador.');
}

map.on('click', function (e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    var text = '';
    while(text == ''){
        text = prompt("Ingrese una descripción para este punto:");
        if(text == null) return;
    }
    
    var marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(text || 'Nuevo punto')
        .openPopup();

    addLocation(lat, lng, text || 'Nuevo punto');

    marker.on('click', function () {
        if (userLatLng) {
            if (currentRoute) {
                map.removeControl(currentRoute);
            }
            currentRoute = L.Routing.control({
                waypoints: [
                    userLatLng,
                    L.latLng(lat, lng)
                ],
                routeWhileDragging: true
            }).addTo(map);
        } else {
            alert('No se pudo obtener tu ubicación.');
        }
    });
});

function drawNewLocations() {
    var locationList = document.getElementById('locations-list');

    while (locationList.firstChild) {
        locationList.removeChild(locationList.firstChild);
    }

    for (let location of locations) {
        var locationItem = document.createElement('div');
        locationItem.className = 'location-item d-flex justify-content-between gap-3 flex-column';
        locationItem.innerHTML = `
        <h5 class='m-0'><i class="fa-solid fa-location-dot pe-2"></i>${location.description}</h5>    
        <div class='d-flex gap-3'>
        <button class='btn btn-dark' onclick="focusOnLocation(${location.lat}, ${location.lng})"><i class="fa-solid fa-eye"></i></button>
        <button class='btn btn-danger' onclick="deleteLocation(${location.lat}, ${location.lng})"><i class="fa-solid fa-trash"></i></button>
        <button class='btn btn-success' onclick="showRoute(${location.lat}, ${location.lng})"><i class="fa-solid fa-route"></i></button>
        </div>
        `;
        locationList.appendChild(locationItem);
        var hr = document.createElement('hr');
        hr.className = 'my-2';
        locationList.appendChild(hr);
    }
}

function addLocation(lat, lng, description) {
    var location = { lat: lat, lng: lng, description: description };
    locations.push(location);
    saveLocations();

    drawNewLocations();
}

function focusOnLocation(lat, lng) {
    var latLng = L.latLng(lat, lng);
    map.setView(latLng, 13);

    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            if (layer.getLatLng().equals(latLng)) {
                layer.openPopup();
            }
        }
    });
}

function showRoute(lat, lng) {
    if (currentRoute) {
        map.removeControl(currentRoute);
    }
    currentRoute = L.Routing.control({
        waypoints: [
            userLatLng,
            L.latLng(lat, lng)
        ],
        routeWhileDragging: false
    }).addTo(map);
}

function deleteLocation(lat, lng) {
    locations = locations.filter(element => element.lat != lat && element.lng != lng);
    saveLocations();
    drawNewLocations();

    var latLngToRemove = L.latLng(lat, lng);
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            if (layer.getLatLng().equals(latLngToRemove)) {
                map.removeLayer(layer);
            }
        }
    });
}

function saveLocations() {
    const aux = JSON.stringify(locations);
    localStorage.setItem('locationsMap', aux);
}

function reloadUserPosition() {
    const loader = document.getElementById('loader-container');
    loader.classList.remove('d-none');

    navigator.geolocation.getCurrentPosition(function (position) {
        const loader = document.getElementById('loader-container');
        loader.classList.add('d-none');

        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        userLatLng = L.latLng(lat, lng);

        localStorage.setItem('userLocation', JSON.stringify(userLatLng));

        map.setView(userLatLng, 13);

        userMarker = L.marker(userLatLng).addTo(map)
            .bindPopup('Estás aquí')
            .openPopup();
    }, function () {
        alert('No es posible obtener tu ubicación...');
    });
}

function drawMarkers() {
    for (let location of locations) {
        L.marker([location.lat, location.lng]).addTo(map)
        .bindPopup(location.description)
        .openPopup();
    }

}