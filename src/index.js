/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('src-fit', {
    dependencies: ['geometry', 'material'],

    schema: {
        orientation: {default: 'auto', oneOf: ['auto', 'width', 'height']},
        maxDimension: {default: -1}
      },

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

    fitWidth: function (w, h) {
        var ratio = (h || 1.0) / (w || 1.0);
        var geo = this.el.components.geometry;
        var newh;
        // W
        if (geo && geo.data.width) {
            //console.log('W');
            newh = geo.data.width * ratio;
            
        } else {  // !W H
            console.log('fitWidth requires geometry.data.width to be set.');
        }
        if (newh !== undefined) { 
            this.el.updateComponent('geometry', {height: newh});
        }
        this.el.emit('fit', [geo.data.width, newh]);
    },

    fitHeight: function (w, h) {
        var ratio = (h || 1.0) / (w || 1.0);
        var geo = this.el.components.geometry;
        var neww;
        // W
        if (geo && geo.data.height) {
            //console.log('H');
            neww = geo.data.width / ratio;
            
        } else {  // !W H
            console.log('fitHeight requires geometry.data.height to be set.');
        }
        if (neww !== undefined) { this.el.updateComponent('geometry', {width: neww});}
        this.el.emit('fit', [neww, geo.data.height]);
    },

    fitMax: function () {
        var geo = this.el.components.geometry;
        var h = geo.data.height;
        var w = geo.data.width;
        var md = this.data.maxDimension;
        var ratio = (h || 1.0) / (w || 1.0);
        var neww, newh;
        // W > md, H > md
        if (w > md && h > md) {
            // H > W
            // set H to md
            if (ratio > 1) {
                newh = md;
                neww = newh / ratio;
            }
            // W > H
            // set W to md
            else {
                neww = md;
                newh = neww * ratio;
            }
        }
        // W > md > H
        else if (w > md) {
            neww = md;
            newh = neww * ratio;
        }
        // H > md > W
        else if (h > md) {
            newh = md;
            neww = newh / ratio;
        }
        if (neww !== undefined) { this.el.updateComponent('geometry', {width: neww});}
        if (newh !== undefined) { this.el.updateComponent('geometry', {height: newh});}
    },

    onMaterialLoaded: function (e) {
        var self = this;
        var src = e.detail.src;
        
        var w = src.videoWidth || src.width;
        var h = src.videoHeight || src.height;
        
        if (this.data.orientation == 'auto' && (w || h)) {
            self.fit(w, h);
        }
        else if (this.data.orientation == 'width') {
            self.fitWidth(w, h);
        }
        else if (this.data.orientation == 'height') {
            self.fitHeight(w, h);
        }

        // maxDimension
        if (this.data.maxDimension > 0){
            self.fitMax();
        }
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
