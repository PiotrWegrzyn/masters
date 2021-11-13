let currentSearchLayer = ADDRESS_LAYER;

let filterFeatures = (features, value) => {
    return features.filter(obj=>isMatch(obj, value))
}
let isMatch = (obj, value) => {
    return JSON.stringify(obj).slice(1,-1).replaceAll('"', "").normalize().toLowerCase().match(value.toLowerCase());
}
let testSearch = (map) => {

    // Holds visible airport features for filtering
    let addresss = [];

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false
    });

    const filterEl = document.getElementById('feature-filter');
    const listingEl = document.getElementById('address-listing');
    const artListingEl = document.getElementById('artillery-listing');
    const landingListingEl = document.getElementById('landing-listing');

    function renderListings(features) {
        const empty = document.createElement('p');
        // Clear any existing listings
        listingEl.innerHTML = '';
        if (features.length) {
            for (const feature of features) {
                const itemLink = document.createElement('a');
                let data = feature.properties;
                itemLink.textContent = `${data["Nazwa zrzutu"] || ""} ${data["Ulica"] || ""} ${data["Miasto"] || ""}`;
                itemLink.addEventListener('mouseover', () => {
                    // Highlight corresponding feature on the map
                    let factory = new AddressTooltipFactory();
                    let tooltip = factory.createTooltip(feature, false);
                    tooltip.addTo(map);
                    itemLink.addEventListener('mouseleave', () => {
                        tooltip.remove();
                    });
                });
                itemLink.addEventListener('click', () => {
                    map.flyTo({
                        center: feature._geometry.coordinates
                    });
                });
                listingEl.appendChild(itemLink);
            }

            // Show the filter input
            filterEl.parentNode.style.display = 'block';
        } else if (features.length === 0 && filterEl.value !== '') {
            empty.textContent = 'No results found';
            listingEl.appendChild(empty);
        } else {
            empty.textContent = 'Drag the map to populate results';
            listingEl.appendChild(empty);
        }
    }

    function normalize(string) {
        return string.trim().toLowerCase();
    }

    map.on('moveend', () => {
        if(currentSearchLayer){
            // const features = map.queryRenderedFeatures({layers: ['adresy-kontaktowe-4jmjk0']});
            let features = map.queryRenderedFeatures(options={
                layers: [currentSearchLayer]
            });

            if (features) {
                renderListings(features);

                // Clear the input container
                filterEl.value = '';

                // Store the current features in sn `addresss` variable to
                // later use for filtering on `keyup`.
                addresss = features;
            }
        }
    });

    filterEl.addEventListener('keyup', (e) => {
        const value = normalize(e.target.value);

        // Filter visible features that match the input value.
        const filtered = [];
        for (const feature of addresss) {
            if (isMatch(feature, value)) {
                filtered.push(feature);
            }
        }

        // Populate the sidebar with filtered results
        renderListings(filtered);

    });

    // Call this function on initialization
    // passing an empty array to render an empty state
    renderListings([]);
}