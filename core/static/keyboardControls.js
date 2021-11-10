class KeyboardControls{
    deltaDistance = 100;
    deltaDegrees = 25; // degrees the map rotates when the left or right arrow is clicked

    static attach = (map) =>{
        map.getCanvas().focus();

        map.getCanvas().addEventListener(
            'keydown',
            (e) => {
                e.preventDefault();
                if (e.which === 38) {
                    // up
                    map.panBy([0, -this.deltaDistance], {
                        easing: this.easing
                    });
                } else if (e.which === 40) {
                    // down
                    map.panBy([0, this.deltaDistance], {
                        easing: this.easing
                    });
                } else if (e.which === 37) {
                    // left
                    map.easeTo({
                        bearing: map.getBearing() - this.deltaDegrees,
                        easing: this.easing
                    });
                } else if (e.which === 39) {
                    // right
                    map.easeTo({
                        bearing: map.getBearing() + this.deltaDegrees,
                        easing: this.easing
                    });
                }
            },
            true
        );
    }

    static easing = (t) =>{
        return t * (2 - t);
    }
}
