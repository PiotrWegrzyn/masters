
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
