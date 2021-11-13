class Tooltip {
    createTooltip(pointData, closeButton=true){
      let geometry = pointData.geometry || pointData._geometry;
      return new mapboxgl.Popup({closeButton: closeButton})
        .setLngLat(geometry.coordinates)
        .setHTML(this.createHtml(pointData.properties));
    }

    createHtml(data){
      let filteredData = this.filterData(data);
      let cleanedData = this.stripEmptyData(filteredData);
      let prettyData = this.formatData(cleanedData);
      let title = this.createTitle(data);
      let html = `<strong>${title}</strong><p>${prettyData}</p>`;

      return html;
    }

    stripEmptyData(data){
        return Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null && v !== ""));
    }

    formatData(data){
        return JSON.stringify(data, null, '<br>').slice(1,-1).replaceAll('"', "");
    }

    filterData(data){
        const clonedData = JSON.parse(JSON.stringify(data));
        delete clonedData['path']
        delete clonedData['Id']
        delete clonedData['layer']
        delete clonedData['ID pliku']

        return clonedData
    }

    createTitle(data) {
        return 'dupa';
    }
}

class AddressTooltip extends Tooltip{
    createTitle = (data) => {
        return `${data["Nazwa zrzutu"] || ""} ${data["Ulica"] || ""} ${data["Miasto"] || ""}`;
    }
}

class ArtilleryTooltip extends Tooltip{
    createTitle = (data) => {
        return `${data["miejsce"] || ""}`;
    }
}

class LandingTooltip extends Tooltip{
    createTitle = (data) => {
        return `Miejsce zrzutu ${data["Nazwa"] || data["layer"]}`;
    }
}

class TooltipFactory{
    createTooltip = (data, layer, closeButton=true) => {
        switch (layer) {
            case ADDRESS_LAYER:
                return new AddressTooltip().createTooltip(data, closeButton);
            case ARTILLERY_LAYER:
                return new ArtilleryTooltip().createTooltip(data, closeButton);
            case LANDINGS_LAYER:
                return new LandingTooltip().createTooltip(data, closeButton);
            default:
                return new Tooltip().createTooltip(data, closeButton);
        }
    }
}

