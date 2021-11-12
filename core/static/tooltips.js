class TooltipFactory {
  createTooltip(pointData, closeButton=true){
      let geometry = pointData.geometry || pointData._geometry;
      return new mapboxgl.Popup({closeButton: closeButton})
        .setLngLat(geometry.coordinates)
        .setHTML(this.createHtml(pointData.properties));
  }

  createHtml(data){
      return JSON.stringify(data, null, '\t');
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
}

class AddressTooltipFactory extends TooltipFactory{
  createHtml(data){
      let filteredData = this.filterData(data);
      let cleanedData = this.stripEmptyData(filteredData);
      let prettyData = this.formatData(cleanedData);
      let html = `<strong>${data["Nazwa zrzutu"] || ""} ${data["Ulica"] || ""} ${data["Miasto"] || ""} </strong><p>${prettyData}</p>`;

      return html;
  }
}

class ArtilleryTooltipFactory extends TooltipFactory{
  createHtml(data){
      let filteredData = this.filterData(data);
      let cleanedData = this.stripEmptyData(filteredData);
      let prettyData = this.formatData(cleanedData);
      let html = `<strong>${data["Nazwa zrzutu"] || ""} ${data["Ulica"] || ""} ${data["Miasto"] || ""} </strong><p>${prettyData}</p>`;

      return html;
  }
}

class LandingTooltipFactory extends TooltipFactory{
  createHtml(data){
      let filteredData = this.filterData(data);
      let cleanedData = this.stripEmptyData(filteredData);
      let prettyData = this.formatData(cleanedData);
      let html = `<strong>Miejsce zrzutu ${data["Nazwa zrzutu"] || ""} ${data["layer"] || ""}</strong><p>${prettyData}</p>`;

      return html;
  }
}