/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

console.log("AFRAME.registerComponent('src-fit', ...");
AFRAME.registerComponent('src-fit', {
    dependencies: ['geometry', 'material'],

    fit: function (w, h) {
        var ratio = (h || 1.0) / (w || 1.0);
        var geo = this.el.components.geometry;
        var neww, newh;
        // W
        if (geo && geo.data.width) {
            // W < H
            if (geo && geo.data.height && ratio > 1) {
                neww = geo.data.width / ratio;
            } else {  // W !H || W > H
                newh = geo.data.width * ratio;
            }
        } else {  // !W H
            if (geo && geo.data.height) {
                neww = geo.data.height / ratio;
            } else { // !W !H
                // variable width and height, stay smaller than 1
                neww = Math.min(1.0, 1.0 / ratio);
                newh = Math.min(1.0, ratio);
            }
        }
        if (neww !== undefined) { this.el.updateComponent('geometry', {width: neww});}
        if (newh !== undefined) { this.el.updateComponent('geometry', {height: newh});}
        this.el.emit('fit', [neww, newh]);
    },

    onMaterialLoaded: function (e) {
        var self = this;
        var src = e.detail.src;
        var w = src.videoWidth || src.width;
        var h = src.videoHeight || src.height;
        if (w || h) { self.fit(w, h); }
    },

    init: function () {
        var el = this.el;
        this.onMaterialLoaded = this.onMaterialLoaded.bind(this);
        el.addEventListener('materialtextureloaded', this.onMaterialLoaded);
        el.addEventListener('materialvideoloadeddata', this.onMaterialLoaded);
    }
});

AFRAME.registerComponent('inherit-fit', {
    schema: { default: 'all', oneOf: ['width', 'height', 'all'] },

    init: function () {
        this.el.parentNode.addEventListener('fit', AFRAME.utils.bind(this.onFit, this), true);
    },

    onFit: function (e) {
        var parentEl = this.el.parentNode;
        if (parentEl && parentEl.components.geometry) {
            if (e.detail[0] && this.data !== 'height') {
                this.el.setAttribute('width', parentEl.components.geometry.data.width);
            }
            if (e.detail[1] && this.data !== 'width') {
                this.el.setAttribute('height', parentEl.components.geometry.data.height);
            }
            // if we have text, change text layout
            // FIXME: need a more sane way to cascade changes through components
            var bmfonttext = this.el.components['bmfont-text'];
            if (bmfonttext) { bmfonttext.updateLayout(bmfonttext.data); }
            var text = this.el.components.text;
            if (text) { text.updateLayout(text.data); }
        }
        // TODO: cascade to children
    }
});
