const oldstyle = 'cknycny9p1m6l17np8zp5s27p';
const style1 = 'ckuo3i3hq301118kfy3ve5nfq';
const style2 = 'ckplemisi0egv17m4exbntnws';
const center = {'lat': 21.01178, 'lon': 52.22}
const zoomLevel = 12;
let searchVisible = false;
mapboxgl.accessToken = 'pk.eyJ1IjoicGlvdHJ3ZWdyenluIiwiYSI6ImNrbnlhcGhjZDFmNTUybnFueDBkaTN2YmoifQ.NtAHQdnLqpzGMssi1NE6rQ';
let addresses = [];
let landings = [];
let artillery = [];


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


function initializeControls(map) {
    KeyboardControls.attach(map);
    DistanceCalculator.attach(map);

    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true
            })
    );
    map.addControl(new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: 'metric'
        })
    );

}

soloMap.on('load', () => {
        hideMap('comparison-map-container');

        initializeControls(soloMap);
        addFeatureTooltips(soloMap);
        testSearch(soloMap);

        soloMap.addControl(new MapboxGLButtonControl({
                className: "mapbox-gl-draw_polygon",
                title: "Compare tool",
                eventHandler: showCompareTool
            })
        )

        soloMap.addControl(new MapboxGLButtonControl({
                className: "mapbox-gl-draw_line",
                title: "Measure tool",
                eventHandler: DistanceCalculator.toggle
            })
        )

        soloMap.addControl(new MapboxGLButtonControl({
                className: "mapbox-gl-draw_point",
                title: "Search tool",
                eventHandler: toggleSearchTool
            })
        )

});

afterMap.on('load', () => {
    initializeControls(afterMap);

    addFeatureTooltips(afterMap);
    addFeatureTooltips(beforeMap);

    afterMap.addControl(new MapboxGLButtonControl({
            className: "mapbox-gl-draw_polygon",
            title: "Solo map",
            eventHandler: showSoloMap
        })
    )
});

function setCityLocation() {
    let coordinates = document.getElementById("city-input").value.split(';')
    beforeMap.flyTo({
        center: [coordinates[0], coordinates[1]],
        essential: true
    });

}
document.getElementById("city-input").addEventListener("change", setCityLocation);
document.getElementById("city-input").addEventListener("change", setCityLocation);


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


function showCompareTool() {
    copyZoomFromTo(soloMap, beforeMap);
    copyCoordsFromTo(soloMap, beforeMap);
    showMap('comparison-map-container');
    hideMap('solo-map-container');
    displayClickedPoint();
    DistanceCalculator.clear();
    distanceContainer = document.getElementById('distanceCompare');
}

function showSoloMap() {
    copyZoomFromTo(beforeMap, soloMap);
    copyCoordsFromTo(beforeMap, soloMap);
    showMap('solo-map-container');
    hideMap('comparison-map-container');
    displayClickedPoint();
    DistanceCalculator.clear();
    distanceContainer = document.getElementById('distanceSolo');
}

function toggleSearchTool() {
    $(".map-overlay").animate({width: searchVisible ? "15%": "0%"},{ duration: 1500});
    searchVisible = !searchVisible;
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

hiddenMap.on('load', () => {
    artillery = getFeatures(ARTILLERY_LAYER);
    addresses = getFeatures(ARTILLERY_LAYER);
    landings = getFeatures(ARTILLERY_LAYER);
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


function addTooltipToMap(map, tooltipFactory, point){
    let pointData = point.features[0];
    let tooltip = tooltipFactory.createTooltip(pointData);
    tooltip.addTo(map);
}