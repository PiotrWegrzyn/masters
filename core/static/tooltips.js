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
}

class AddressTooltipFactory extends TooltipFactory{
  createHtml(data){
      let cleanedData = this.stripEmptyData(data);
      let prettyData = this.formatData(cleanedData);
      let html = `<strong>${data["Nazwa zrzutu"] || ""} ${data["Ulica"] || ""} ${data["Miasto"] || ""} </strong><p>${prettyData}</p>`;

      return html;
  }
}

class ArtilleryTooltipFactory extends TooltipFactory{
  createHtml(data){
      let cleanedData = this.stripEmptyData(data);
      let prettyData = this.formatData(cleanedData);
      let html = `<strong>${data["Nazwa zrzutu"] || ""} ${data["Ulica"] || ""} ${data["Miasto"] || ""} </strong><p>${prettyData}</p>`;

      return html;
  }
}

class LandingTooltipFactory extends TooltipFactory{
  createHtml(data){
      let cleanedData = this.stripEmptyData(data);
      let prettyData = this.formatData(cleanedData);
      let html = `<strong>${data["Nazwa zrzutu"] || ""} ${data["Ulica"] || ""} ${data["Miasto"] || ""} </strong><p>${prettyData}</p>`;

      return html;
  }
}