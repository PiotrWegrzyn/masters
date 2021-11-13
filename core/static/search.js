class SearchController{

    constructor(map) {
        this.keyword = ""
        this.map = map
        this.filterEl = document.getElementById('feature-filter');
        this.addressListingEl = document.getElementById('address-listing');
        this.artListingEl = document.getElementById('artillery-listing');
        this.landingListingEl = document.getElementById('landing-listing');
        this.tooltipFacotry = new TooltipFactory()
        this.attach(map);

        this.filterEl.parentNode.style.display = 'block';

    }

    attach = (map) =>{
        map.on('moveend', () => {
            this.sync()
        });

        this.filterEl.addEventListener('keyup', (e) => {
            this.keyword = SearchController.normalize(e.target.value);
            this.sync();
        });

        this.sync()
    }

    sync() {
        this.syncLayer(ADDRESS_LAYER);
        this.syncLayer(LANDINGS_LAYER);
        this.syncLayer(ARTILLERY_LAYER);
    }

    syncLayer(layer){
        let features = this.getFeatures(layer);
        features = this.filterFeatures(features)

        let listingEl = this.getListingElement(layer)
        // Clear any existing listings
        listingEl.innerHTML = '';
        if (features.length) {
            for (const feature of features) {
                let newItem = this.createItem(feature, layer)
                listingEl.appendChild(newItem);
            }

        } else if (features.length === 0 && this.filterEl.value !== '') {
            const empty = document.createElement('p');
            empty.textContent = 'No results found';
            listingEl.appendChild(empty);
        } else {
            const empty = document.createElement('p');
            empty.textContent = 'Drag the map to populate results';
            listingEl.appendChild(empty);
        }
    }

    filterFeatures = (features) =>{
        if(this.keyword === '') return features;
        const filtered = [];

        for (const feature of features) {
            if (SearchController.isMatch(feature, this.keyword)) {
                filtered.push(feature);
            }
        }

        return filtered;
    }

    getFeatures = (layer) =>{
        return this.map.queryRenderedFeatures(options={
            layers: [layer]
        });
    }

    createItem = (feature, layer) => {
        const itemLink = document.createElement('a');
        let data = feature.properties;
        itemLink.textContent = this.getItemTitle(data, layer);

        itemLink.addEventListener('mouseover', () => {
            let tooltip = this.tooltipFacotry.createTooltip(feature, layer, false);
            tooltip.addTo(this.map);
            itemLink.addEventListener('mouseleave', () => {
                tooltip.remove();
            });
        });
        itemLink.addEventListener('click', () => {
            this.map.flyTo({
                center: feature._geometry.coordinates
            });
        });

        return itemLink;
    }

    getListingElement = (layer) => {
        switch (layer) {
            case ADDRESS_LAYER:
                return this.addressListingEl;
            case ARTILLERY_LAYER:
                return this.artListingEl;
            case LANDINGS_LAYER:
                return this.landingListingEl;
        }
    }

    getItemTitle = (feature, layer) => {
        switch (layer) {
            case ADDRESS_LAYER:
                return new AddressTooltip().createTitle(feature);
            case ARTILLERY_LAYER:
                return new ArtilleryTooltip().createTitle(feature);
            case LANDINGS_LAYER:
                return new LandingTooltip().createTitle(feature);
        }
    }

    static isMatch = (obj, value) => {
        return JSON.stringify(obj).slice(1,-1).replaceAll('"', "").normalize().toLowerCase().match(value.toLowerCase());
    }

    static normalize = (string) => {
        return string.trim().toLowerCase();
    }

}
