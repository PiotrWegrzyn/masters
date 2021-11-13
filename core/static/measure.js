let distanceContainer = document.getElementById('distanceSolo');
let measureTool = false;

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

class DistanceCalculator{
    static attach = (map) => {
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

    static clear() {
        geojson.features = [];
        distanceContainer.innerHTML = '';
        soloMap.getSource('geojson').setData(geojson);
        beforeMap.getSource('geojson').setData(geojson);
    }

    static toggle() {
        measureTool = !measureTool;
        DistanceCalculator.clear();
    }
}




