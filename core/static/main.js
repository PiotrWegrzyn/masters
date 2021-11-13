const oldstyle = 'cknycny9p1m6l17np8zp5s27p';
const style1 = 'ckuo3i3hq301118kfy3ve5nfq';
const style2 = 'ckplemisi0egv17m4exbntnws';
const center = {'lat': 21.01178, 'lon': 52.22}
const zoomLevel = 12;
mapboxgl.accessToken = 'pk.eyJ1IjoicGlvdHJ3ZWdyenluIiwiYSI6ImNrbnlhcGhjZDFmNTUybnFueDBkaTN2YmoifQ.NtAHQdnLqpzGMssi1NE6rQ';
let addresses = [];
let landings = [];
let artillery = [];

let tooltipFactory = new TooltipFactory();

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

let soloMap = new mapboxgl.Map({
    container: 'historicSolo',
    center: [center.lat, center.lon],
    zoom: zoomLevel,
    style: 'mapbox://styles/piotrwegrzyn/' + style1
});

let map = new mapboxgl.Compare(
    beforeMap,
    afterMap,
    '#comparasion-map',
);

let searchController


function initializeControls(map) {
    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        })
    );
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

    searchController = new SearchController(soloMap);
    searchController.sync();

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

function showCompareTool() {
    copyZoomFromTo(soloMap, afterMap);
    copyCoordsFromTo(soloMap, afterMap);
    showMap('comparison-map-container');
    hideMap('solo-map-container');
    DistanceCalculator.clear();
    distanceContainer = document.getElementById('distanceCompare');
}

function showSoloMap() {
    copyZoomFromTo(afterMap, soloMap);
    copyCoordsFromTo(afterMap, soloMap);
    showMap('solo-map-container');
    hideMap('comparison-map-container');
    DistanceCalculator.clear();
    distanceContainer = document.getElementById('distanceSolo');
}

function toggleSearchTool() {
    searchController.toggle();
    $(".map-overlay").animate({width: searchController.isVisible() ? "100%": "0%"},{ duration: 300});
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

function addPointTooltipListener(map, layer) {
    map.on('click', layer, (point) => {
        addTooltipToMap(map, point, layer)
        map.flyTo({
                center: point.features[0].geometry.coordinates
        });
    });
}

function addFeatureTooltips(map){

    addPointTooltipListener(map, ADDRESS_LAYER);
    addMousePointer(map, ADDRESS_LAYER);

    addPointTooltipListener(map, LANDINGS_LAYER);
    addMousePointer(map, LANDINGS_LAYER);

    addPointTooltipListener(map, ARTILLERY_LAYER);
    addMousePointer(map, ARTILLERY_LAYER);
}


function addTooltipToMap(map, point, layer){
    let pointData = point.features[0];
    let tooltip = tooltipFactory.createTooltip(pointData, layer);
    tooltip.addTo(map);
}