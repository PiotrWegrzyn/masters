const oldstyle = 'cknycny9p1m6l17np8zp5s27p';
const style1 = 'ckuo3i3hq301118kfy3ve5nfq';
const style2 = 'ckplemisi0egv17m4exbntnws';
const center = {'lat': 21.01178, 'lon': 52.17}
const zoomLevel = 12;
mapboxgl.accessToken = 'pk.eyJ1IjoicGlvdHJ3ZWdyenluIiwiYSI6ImNrbnlhcGhjZDFmNTUybnFueDBkaTN2YmoifQ.NtAHQdnLqpzGMssi1NE6rQ';

let beforeMap = new mapboxgl.Map({
    container: 'streets',
    style: 'mapbox://styles/piotrwegrzyn/' + style1,
    center: [center.lat, center.lon],
    zoom: zoomLevel,

});

let afterMap = new mapboxgl.Map({
    container: 'historic',
    center: [center.lat, center.lon],
    zoom: zoomLevel,
    style: 'mapbox://styles/piotrwegrzyn/' + style2
});

afterMap.addControl(
    new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
    })
);

let soloMap = new mapboxgl.Map({
    container: 'historicSolo',
    center: [center.lat, center.lon],
    zoom: zoomLevel,
    style: 'mapbox://styles/piotrwegrzyn/' + style1
});

soloMap.addControl(
    new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
    })
);

let container = '#comparasion-map';

let map = new mapboxgl.Compare(
    beforeMap,
    afterMap,
    container,
);

const distanceContainer = document.getElementById('distance');

// GeoJSON object to hold our measurement features
const geojson = {
    'type': 'FeatureCollection',
    'features': []
};

// Used to draw a line between points
const linestring = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};

function easing(t) {
    return t * (2 - t);
}

beforeMap.on('load', () => {

    afterMap.addControl(new mapboxgl.NavigationControl());
    soloMap.addControl(new mapboxgl.NavigationControl());

    addKeyboardControl(afterMap);
    addMeasurePoints(beforeMap);

    addKeyboardControl(soloMap);
    addMeasurePoints(soloMap);

    hideMap('comparison-map-container');
    // hideMap('solo-map-container');

});

$('select').selectpicker();

function setCityLocation() {
    let coordinates = document.getElementById("city-input").value.split(';')
    beforeMap.flyTo({
        center: [coordinates[0], coordinates[1]],
        essential: true
    });

}
document.getElementById("city-input").addEventListener("change", setCityLocation);

function addKeyboardControl(map){
    const deltaDistance = 100;

    // degrees the map rotates when the left or right arrow is clicked
    const deltaDegrees = 25;

    map.getCanvas().focus();

    map.getCanvas().addEventListener(
        'keydown',
        (e) => {
            e.preventDefault();
            if (e.which === 38) {
                // up
                map.panBy([0, -deltaDistance], {
                    easing: easing
                });
            } else if (e.which === 40) {
                // down
                map.panBy([0, deltaDistance], {
                    easing: easing
                });
            } else if (e.which === 37) {
                // left
                map.easeTo({
                    bearing: map.getBearing() - deltaDegrees,
                    easing: easing
                });
            } else if (e.which === 39) {
                // right
                map.easeTo({
                    bearing: map.getBearing() + deltaDegrees,
                    easing: easing
                });
            }
        },
        true
    );
}

function addMeasurePoints(map){
    map.addSource('geojson', {
        'type': 'geojson',
        'data': geojson
    });

    // Add styles to the beforeMap
    map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'geojson',
        paint: {
            'circle-radius': 5,
            'circle-color': '#000'
        },
        filter: ['in', '$type', 'Point']
    });
    map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'geojson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': '#000',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });


    map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });

        // Remove the linestring from the group
        // so we can redraw it based on the points collection.
        if (geojson.features.length > 1) geojson.features.pop();

        // Clear the distance container to populate it with a new value.
        distanceContainer.innerHTML = '';

        // If a feature was clicked, remove it from the map.
        if (features.length) {
            const id = features[0].properties.id;
            geojson.features = geojson.features.filter((point) => point.properties.id !== id);
        } else {
            const point = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [e.lngLat.lng, e.lngLat.lat]
                },
                'properties': {
                    'id': String(new Date().getTime())
                }
            };

            geojson.features.push(point);
        }

        if (geojson.features.length > 1) {
            linestring.geometry.coordinates = geojson.features.map(
                (point) => point.geometry.coordinates
            );

            geojson.features.push(linestring);

            // Populate the distanceContainer with total distance
            const value = document.createElement('pre');
            const distance = turf.length(linestring);
            value.textContent = `Total distance: ${distance.toLocaleString()}km`;
            distanceContainer.appendChild(value);
        }

        map.getSource('geojson').setData(geojson);
    });

    map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });
        // Change the cursor to a pointer when hovering over a point on the map.
        // Otherwise cursor is a crosshair.
        map.getCanvas().style.cursor = features.length ? 'pointer': 'crosshair';
    });
}

function showMap(mapId){
    document.getElementById(mapId).classList.add("h-100", "d-flex", "flex-column");
}

function hideMap(mapId){
    document.getElementById(mapId).classList.remove("h-100", "d-flex", "flex-column");
}

function showCompareTool() {
    copyZoomFromTo(soloMap, beforeMap);
    copyCoordsFromTo(soloMap, beforeMap);
    showMap('comparison-map-container');
    hideMap('solo-map-container');
}

function showSoloMap() {
    copyZoomFromTo(beforeMap, soloMap);
    copyCoordsFromTo(beforeMap, soloMap);
    showMap('solo-map-container');
    hideMap('comparison-map-container');
}

function copyZoomFromTo(sourceMap, destinationMap){
    let zoom = sourceMap.getZoom();

    destinationMap.setZoom(zoom);
}

function copyCoordsFromTo(sourceMap, destinationMap){
    let coords = sourceMap.getCenter()

    destinationMap.jumpTo({
        center: [coords.lng, coords.lat],
        essential: true
    });
}

function addButton(menu, id, text, callback, className=''){
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = text;
        link.className = className;

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            callback();
        };


        menu.appendChild(link);
}

soloMap.on('load', () => {
        let menu = document.getElementById('soloMapMenu');
        addButton(menu, 'compare', 'Compare Tool OFF', showCompareTool, 'gray')

        menu = document.getElementById('comparisonMapMenu');
        addButton(menu, 'compare', 'Compare Tool ON', showSoloMap, 'green')
});

