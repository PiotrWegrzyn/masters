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

            beforeMap.on('load', () => {
                beforeMap.addSource('geojson', {
                'type': 'geojson',
                'data': geojson
                });

                // Add styles to the beforeMap
                beforeMap.addLayer({
                    id: 'measure-points',
                    type: 'circle',
                    source: 'geojson',
                    paint: {
                        'circle-radius': 5,
                        'circle-color': '#000'
                    },
                    filter: ['in', '$type', 'Point']
                });
                beforeMap.addLayer({
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

                beforeMap.on('click', (e) => {
                    const features = beforeMap.queryRenderedFeatures(e.point, {
                        layers: ['measure-points']
                    });

                    // Remove the linestring from the group
                    // so we can redraw it based on the points collection.
                    if (geojson.features.length > 1) geojson.features.pop();

                    // Clear the distance container to populate it with a new value.
                    distanceContainer.innerHTML = '';

                    // If a feature was clicked, remove it from the beforeMap.
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

                    beforeMap.getSource('geojson').setData(geojson);
                });

                beforeMap.on('click', 'zrzutymerge-btmnix', (e) => {
                    beforeMap.flyTo({
                        center: e.features[0].geometry.coordinates
                    });
                });

                // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
                beforeMap.on('mouseenter', 'zrzutymerge-btmnix', () => {
                    beforeMap.getCanvas().style.cursor = 'pointer';
                });

                // Change it back to a pointer when it leaves.
                beforeMap.on('mouseleave', 'zrzutymerge-btmnix', () => {
                    beforeMap.getCanvas().style.cursor = '';
                });

                beforeMap.addControl(new mapboxgl.NavigationControl());
            });

            beforeMap.on('mousemove', (e) => {
                const features = beforeMap.queryRenderedFeatures(e.point, {
                    layers: ['measure-points']
                });
                // Change the cursor to a pointer when hovering over a point on the beforeMap.
                // Otherwise cursor is a crosshair.
                beforeMap.getCanvas().style.cursor = features.length ? 'pointer': 'crosshair';
            });

            $('select').selectpicker();

            function setCityLocation() {
                let coordinates = document.getElementById("city-input").value.split(';')
                beforeMap.flyTo({
                    center: [coordinates[0], coordinates[1]],
                    essential: true
                });
                // Find features intersecting the bounding box.
                //console.log(beforeMap);
                //const selectedFeatures = beforeMap.queryRenderedFeatures(options={
                //layers: ['zrzutymerge-btmnix']
                //});
                //console.log(selectedFeatures);
                //const fips = selectedFeatures.map(
                //(feature) => feature.properties.Nazwa
                //);
                //console.log(fips);

            }
            document.getElementById("city-input").addEventListener("change", setCityLocation);
