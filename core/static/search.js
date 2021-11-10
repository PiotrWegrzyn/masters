let search = (features, value) =>{
    let filteredFeatures = filterFeatures(features, value);
    //hide features that were not filtered
    //zoom too filtered features
}


let filterFeatures = (features, value) => {
    return features.filter(obj=>isMatch(obj, value))
}
let isMatch = (obj, value) => {
    return JSON.stringify(obj).slice(1,-1).replaceAll('"', "").match(value);
}
