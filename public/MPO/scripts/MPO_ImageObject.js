
function MPO_ImageObject() {

	this.widthInProjection =  0;
	this.widthInPixels = 0;
	this.scale = 1;  // On save, reset this to 1
	this.resolution = 0;
	this.opacity = 0.7;
	this.imageNumber = -1;
	this.inputFileName = null;
	this.fileImage = null;
	this.title = null;
	this.attribution = null;
	this.center = [0,0];
	this.pictureLayer = null;
	this.indexInDB = -1;


	this.setImageNumber = function (imageNumber) {
		this.imageNumber = imageNumber;
	}

	this.getImageNumber = function () {
		return this.imageNumber;
	}


	this.setCenter = function(center) {
		this.center = center;
		this.displayImage();
	}

	this.getCenter = function() {
		return this.center;
	}

	this.getScale = function() {
		return this.scale;
	}

	this.setScale = function(scaleFactor) {
		this.scale = scaleFactor;
		this.displayImage();
	}

	this.setTitle = function(title) {
		this.title = title;
	}

	this.getTitle = function() {
		return this.title;
	}

	this.setInputFileName = function(fileName) {
		this.inputFileName = fileName;
	}

	this.getInputFileName = function() {
		return fileName;
	}

	this.setFileImage = function (fileImage) {
		this.fileImage = fileImage;
	}

	this.setOpacity = function(opacity) {
		this.opacity = opacity;
		this.displayImage();
	}

	this.getOpacity = function() {
		return this.opacity;
	}

	this.setAttribution = function(attribution) {
		this.attribution = attribution;
	}

	this.getAttribution = function() {
		return this.attribution;
	}

	this.displayImage = function() {
		if (this.pictureLayer != null) {
			mapOb.removeLayer(currentImageObject.pictureLayer);
		}

		var cnv = document.createElement('canvas');
		var ctx = cnv.getContext('2d');
		var img = new Image();

		var resolutionUnits = mapOb.getView().getResolution();
		var pointFeature = new ol.Feature(new ol.geom.Point(this.center));

		var length = currentImageObject.widthInPixels / 2;
		var height = length / currentImageObject.ratioXtoY;
		var polygonFeature = new ol.Feature(new ol.geom.Polygon([[
			[this.center[0] - length, this.center[1] - height],
			[this.center[0] - length, this.center[1] + height],
			[this.center[0] + length, this.center[1] + height],
			[this.center[0] + length, this.center[1] - height],
			[this.center[0] - length, this.center[1] - height]]]));

			var sizeofImage = ((this.widthInProjection/resolutionUnits)/
			this.fileImage.width) * this.scale;

			// img.src = this.fileImage.src;
			// img.onload = function(){
			// 	var pattern = ctx.createPattern(img, 'repeat');
			//
			// 	polygonFeature.setStyle(new ol.style.Style({
			// 		fill: new ol.style.Fill({
			// 			image: pattern
			// 		})
			// 	}));
			// };
			//
			// var vectorSource = new ol.source.Vector({
			// 	features: [polygonFeature]
			// });
			// this.pictureLayer = new ol.layer.Vector({
			// 	source: vectorSource
			// });
			this.pictureLayer =  new ol.layer.Vector({
				source: new ol.source.Vector({
					features: [pointFeature]
				}),
				style: new ol.style.Style({
					image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
						anchor: [0.5, 0.5],
						anchorXUnits: 'fraction',
						anchorYUnits: 'fraction',
						opacity: this.opacity,
						scale: sizeofImage,
						src: this.fileImage.src,
					})),
					stroke: new ol.style.Stroke({
						width: 3,
						color: [255, 0, 0, 1]
					}),
					fill: new ol.style.Fill({
						color: [0, 0, 255, 0.6]
					})
				}),
			});

			//Add new picture layer
			mapOb.addLayer(this.pictureLayer);
		}

		this.displayNewImage = function(pixels) {
			if (this.pictureLayer != null) {
				mapOb.removeLayer(currentImageObject.pictureLayer);
			}
			this.center=mapOb.getView().getCenter();
			this.ratioXtoY = this.fileImage.width / this.fileImage.height;
			var resolutionUnits = mapOb.getView().getResolution();
			this.widthInProjection =  resolutionUnits * (pixels);
			this.widthInPixels = this.fileImage.width;
			this.scale = 1.0;

			this.displayImage();
		}

		this.displayOldImage = function (pixels) {
            if (this.pictureLayer != null) {
                mapOb.removeLayer(currentImageObject.pictureLayer);
            }
            this.ratioXtoY = this.fileImage.width / this.fileImage.height;
            var resolutionUnits = mapOb.getView().getResolution();
            this.widthInProjection =  resolutionUnits * (pixels);
            this.widthInPixels = this.fileImage.width;
            this.displayImage();
        }
	}
