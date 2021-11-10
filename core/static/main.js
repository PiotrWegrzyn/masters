const oldstyle = 'cknycny9p1m6l17np8zp5s27p';
const style1 = 'ckuo3i3hq301118kfy3ve5nfq';
const style2 = 'ckplemisi0egv17m4exbntnws';
const center = {'lat': 21.01178, 'lon': 52.22}
const zoomLevel = 12;
mapboxgl.accessToken = 'pk.eyJ1IjoicGlvdHJ3ZWdyenluIiwiYSI6ImNrbnlhcGhjZDFmNTUybnFueDBkaTN2YmoifQ.NtAHQdnLqpzGMssi1NE6rQ';
let addresses = [];
let drops = [];
let artillery = [];
let measureTool = false;
ADDRESS_LAYER = 'adresy-kontaktowe-4jmjk0';
LANDINGS_LAYER = 'zrzutymerge-btmnix';
ARTILLERY_LAYER = 'artmerged-5c2el3';


let hiddenMap = new mapboxgl.Map({
    container: 'hiddenMap',
    style: 'mapbox://styles/piotrwegrzyn/' + style1,
    center: [center.lat, center.lon],
    zoom: 1,

});

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

let distanceContainer = document.getElementById('distanceSolo');

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

function getFeatures(layer){
     return hiddenMap.queryRenderedFeatures(options={
        layers: [layer]
    });
}

beforeMap.on('load', () => {

    afterMap.addControl(new mapboxgl.NavigationControl());
    soloMap.addControl(new mapboxgl.NavigationControl());

    KeyboardControls.attach(afterMap);
    addMeasurePointsFunctionality(beforeMap);

    KeyboardControls.attach(soloMap);
    addMeasurePointsFunctionality(soloMap);

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
document.getElementById("city-input").addEventListener("change", setCityLocation);

function addMeasurePointsFunctionality(map){
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
        if(measureTool){
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
        }

    });
    addMousePointer(map, 'measure-points');
}

function showMap(mapId){
    document.getElementById(mapId).classList.add("h-100", "d-flex", "flex-column");
}

function hideMap(mapId){
    document.getElementById(mapId).classList.remove("h-100", "d-flex", "flex-column");
}

function displayClickedPoint() {
    console.log(beforeMap)
    let selectedFeatures = beforeMap.queryRenderedFeatures(options={
        layers: [ADDRESS_LAYER]
    });
    console.log(selectedFeatures);
    const fips = selectedFeatures.map(
        (feature) => feature.properties.Nazwa
    );
    console.log(fips);
}

function clearMeasurePoints() {
    geojson.features = [];
    distanceContainer.innerHTML = '';
    soloMap.getSource('geojson').setData(geojson);
    beforeMap.getSource('geojson').setData(geojson);
}

function showCompareTool() {
    copyZoomFromTo(soloMap, beforeMap);
    copyCoordsFromTo(soloMap, beforeMap);
    showMap('comparison-map-container');
    hideMap('solo-map-container');
    displayClickedPoint();
    clearMeasurePoints();
    distanceContainer = document.getElementById('distanceCompare');
}

function showSoloMap() {
    copyZoomFromTo(beforeMap, soloMap);
    copyCoordsFromTo(beforeMap, soloMap);
    showMap('solo-map-container');
    hideMap('comparison-map-container');
    displayClickedPoint();
    clearMeasurePoints();
    distanceContainer = document.getElementById('distanceSolo');
}

function toggleMeasure() {
    measureTool = !measureTool;
    clearMeasurePoints();
    let measureBtns = document.getElementsByClassName('measureBtn');
       for (let item of measureBtns) {
        item.classList.remove([!measureTool ? "green": "gray"]);
        item.classList.add([measureTool ? "green": "gray"]);
        item.textContent = "Measure Tool " + (measureTool ? "ON": "OFF");
    }
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
        addButton(menu, '', 'Measure Tool OFF', toggleMeasure, 'gray measureBtn')

        menu = document.getElementById('comparisonMapMenu');
        addButton(menu, 'compare', 'Compare Tool ON', showSoloMap, 'green')
        addButton(menu, '', 'Measure Tool OFF', toggleMeasure, 'gray measureBtn')
        addFeatureTooltips(beforeMap);
        addFeatureTooltips(soloMap);
});

function loadAddressOptions() {
    let features = getFeatures(ADDRESS_LAYER);
    let counter = 0;
    addresses = features.map(
        (feature) => {
            let props = feature.properties;

            let address = {
                id: counter,
                label: props["Nazwa zrzu"],
                pos: {
                    lat: props.X,
                    lon: props.Y
                },
                city: props.Miasto,
                street: props.Ulica,
                desc: props.Opis
            }
            counter++;

            return address
        }
    );

    console.log(selectedFeatures);
    console.log(addresses);
}

hiddenMap.on('load', () => {
    loadAddressOptions();
});

function addPointTooltipListener(map, TooltipFactoryClass, layer) {
    map.on('click', layer, (point) => {
        let factory = new TooltipFactoryClass();
        addTooltipToMap(map, factory, point)
        map.flyTo({
                center: point.features[0].geometry.coordinates
        });
    });
}

function addFeatureTooltips(map){

    addPointTooltipListener(map, AddressTooltipFactory, ADDRESS_LAYER);
    addMousePointer(map, ADDRESS_LAYER);

    addPointTooltipListener(map, LandingTooltipFactory, LANDINGS_LAYER);
    addMousePointer(map, LANDINGS_LAYER);

    addPointTooltipListener(map, ArtilleryTooltipFactory, ARTILLERY_LAYER);
    addMousePointer(map, ARTILLERY_LAYER);
}

function addMousePointer(map, layer){
    // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
    map.on('mousemove', layer , () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
    });
}

function addTooltipToMap(map, tooltipFactory, point){
    let pointData = point.features[0];
    let tooltip = tooltipFactory.createTooltip(pointData);
    tooltip.addTo(map);
}