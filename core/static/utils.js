ADDRESS_LAYER = 'adresy-kontaktowe';
LANDINGS_LAYER = 'zrzuty';
ARTILLERY_LAYER = 'artyleria';

function showMap(mapId){
    document.getElementById(mapId).classList.add("h-100", "d-flex", "flex-column");
}

function hideMap(mapId){
    document.getElementById(mapId).classList.remove("h-100", "d-flex", "flex-column");
}

function getFeatures(layer){
     return hiddenMap.queryRenderedFeatures(options={
        layers: [layer]
    });
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
