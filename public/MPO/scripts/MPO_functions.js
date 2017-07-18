function showMapOptions() {
	if ($('#mapOptionsBox')[0].checked) {
		$('#mapOptions').show(200);
	}
	else {
		$('#mapOptions').hide(200);
	}
}

function saveMapOptions() {
	if ($("#mapOptionsButton")[0].value == "Save") {
		$("#mapOptionsText")[0].innerHTML = "Click Edit to change the background map.  Note that changing the background map invalidates all images on the map.";
		$("#mapOptionsSet")[0].src="checkbox_checked.png";
		$("#mapOptionsButton")[0].value="Edit";
		$("#mapImagesText")[0].innerHTML = "Click the Add button to add an image";
		$("#mapAddImagesButton")[0].disabled = false;

		var center=mapOb.getView().getCenter();
		var zoomLevel=mapOb.getView().getZoom();
		// Sets the resolution to the 1/2 the max size of width and height in pixels at zoom level.
		var resolution = mapOb.getView().getResolution() * 450;
		var boxExtent = new Array(4);
		boxExtent[0] = center[0] - resolution;
		boxExtent[1] = center[1] - resolution;
		boxExtent[2] = center[0] + resolution;
		boxExtent[3] = center[1] + resolution;
		var view=new ol.View({
			center: center,
			zoom: zoomLevel,
			extent: boxExtent,
			maxZoom: zoomLevel+6,
			minZoom: zoomLevel
		});
		mapOb.setView(view);
		mapOb.getView().on("change:resolution", function() {
			if (currentImageObject != null)
			currentImageObject.displayImage();
		});

		backgroundMap.change(true, view);
	}
	else {
		if (confirm("all pictureLayers will be removed")){
			$("#mapOptionsText")[0].innerHTML = "Set the background map you wish to use, and press the save button.";
			$("#mapOptionsSet")[0].src="checkbox_unchecked.png";
			$("#mapOptionsButton")[0].value="Save";
			$("#mapImagesText")[0].innerHTML = "You cannot add images until the map is set ";
			$("#mapAddImagesButton")[0].disabled = true;

			var center=mapOb.getView().getCenter();
			var zoomLevel=mapOb.getView().getZoom();
			var view=new ol.View({
				center: center,
				zoom: zoomLevel,
			});
			mapOb.setView(view);
			backgroundMap.change(false, view);
		}
	}
}

function showImagesOptions() {
	if ($('#mapImagesBox')[0].checked) {
		$('#mapImages_Images').show(200);
	}
	else {
		$('#mapImages_Images').hide(200);
	}
}

function showImageControlPanel(imageNumber) {

	if (currentImageObject != null)
	mapOb.removeLayer(currentImageObject.pictureLayer);

	if (imageNumber == -1) {
		$("#filePreview")[0].src = "";;
		$("#imageFileTitle")[0].value = "";
		$("#imageFileSource")[0].value = "";
		currentImageObject = new MPO_ImageObject();
		document.getElementById("newOpacity").value = 70;
		document.getElementById("newSize").value = 50;
	}

	else {
		currentImageObject = imagesOnMap[imageNumber];
		currentImageObject.setImageNumber(imageNumber);
		$("#filePreview")[0].src = currentImageObject.fileImage.src;
		$("#imageFileTitle")[0].value = currentImageObject.title;
		//$("#imageFileSource")[0].value = currentImageObject.originURL;
		document.getElementById("newOpacity").value = currentImageObject.getOpacity() * 100;
		document.getElementById("newSize").value = currentImageObject.getScale() * 50;
		// This has to be changed to reculate the picture every time due to the zoom level.
		if(currentImageObject.pictureLayer != null) {
            mapOb.addLayer(currentImageObject.pictureLayer);
        }
        else{
			currentImageObject.displayOldImage(200);
        }

	}
	$('#mapImageControlPanel').show(200);
    $('#mapImages')[0].style.height = "340px";
}

function cancelImageEdit() {
	if (currentImageObject != null) {
		mapOb.removeLayer(currentImageObject.pictureLayer);
		currentImageObject = null;
	}
	$('#mapImageControlPanel').hide(200);
    $('#mapImages')[0].style.height = "675px";
}

function saveImageEdit() {
	if (currentImageObject.inputFileName == null) {
		alert("You have not chosen a map image");
		return;
	}
	currentImageObject.setTitle($("#imageFileTitle")[0].value);
	//currentImageObject.setAttribution($("#imageFileSource")[0].value);
	$('#inputSize')[0].value = "";
	var imageNumber;

	if (currentImageObject.getImageNumber() == -1) {
		imageNumber = imagesOnMap.length;
		imagesOnMap[imageNumber] = currentImageObject;

		parentMapDiv = $("#mapImages_Images")[0];
		newDiv = document.createElement('div');
        newDiv.setAttribute('id', 'imageDiv' + imageNumber);
        newDiv.className = 'overlayImageDiv';
		parentMapDiv.appendChild(newDiv);

		newImageDiv = document.createElement('div');
		newImageDiv.className = "overlayImageDiv_Image";
		newImageDiv.innerHTML = '<img src="" height="60px" id="filePreview' + imageNumber + '" />';
		newDiv.appendChild(newImageDiv);

		newInfoDiv = document.createElement('div');
		newInfoDiv.className = "overlayImageDiv_Info";
		newInfoDiv.innerHTML = "<p id='imageTitle" + imageNumber + "'> </p>";
		newInfoDiv.innerHTML += '<p><input type="button" value="Edit" onClick="showImageControlPanel('+ imageNumber + ')" />'
       + '<input type="button" value="Delete" onClick="deleteArticle('+ imageNumber + ')" /> </p>';

        newDiv.appendChild(newInfoDiv);
        saveToFile(1);
	}
	else {
		imageNumber = currentImageObject.getImageNumber();
		imagesOnMap[imageNumber] = currentImageObject;
		//update
     	saveToFile(-1, imageNumber);
        // editArticle(file, imageNumber)
	}

	document.getElementById("filePreview"+imageNumber).src = currentImageObject.fileImage.src;
	document.getElementById("imageTitle"+imageNumber).innerHTML = "Title: " + currentImageObject.title;
    if (currentImageObject != null) {
        mapOb.removeLayer(currentImageObject.pictureLayer);
        currentImageObject = null;
    }
    $('#mapImageControlPanel').hide(200);
    $('#mapImages')[0].style.height = "675px";
}

function changeOpacity() {
    if (currentImageObject.inputFileName != null) {
        opacityValue = document.getElementById("newOpacity").value / 100;
        currentImageObject.setOpacity(opacityValue);
    }
    else{
        alert("a picture need to be choose first");
    }
}

function changeSize() {
	if (currentImageObject.inputFileName != null){
		var value = $("#newSize")[0].value/50;
		currentImageObject.setScale(value);
		$('#inputSize')[0].value = Math.round(value*100);
	}
	else{
		alert("a picture need to be choose first");
	}
}

function changeSizeText() {
	if (currentImageObject.inputFileName != null){
		var value = $('#inputSize')[0].value/100;
		currentImageObject.setScale(value);
		$('#newSize')[0].value = value*50;
	}
	else{
		alert("a picture need to be choose first");
	}
}

function saveToFile(j, imageNumber){
    var center = currentImageObject.center;
    var scale = currentImageObject.getScale();
    var length = (currentImageObject.widthInProjection * scale)/ 2;
    var height = length / currentImageObject.ratioXtoY;
    var extentCoord = [center[0] - length, center[1] - height, center[0] + length, center[1] + height];
    var extentLonLat = ol.proj.transformExtent(extentCoord, 'EPSG:3857', 'EPSG:4326');
    if (j > 0) {
        writeArticle({
            title: currentImageObject.title,
            center: JSON.stringify(center),
            scale: scale,
            extent: JSON.stringify(extentLonLat),
            url: currentImageObject.inputFileName,
            description: "need to add a description"
        });
    }
    else{
    	editArticle({
            title: currentImageObject.title,
            center: JSON.stringify(center),
            scale: scale,
            extent: JSON.stringify(extentLonLat),
            url: currentImageObject.inputFileName,
            description: "need to add a description"
        }, imageNumber);
	}
    alert("Your picture is successfully saved.");
}

function readArticle() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/images.json"
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function ()
    {
        if(xmlhttp.readyState === 4)
        {
            if(xmlhttp.status === 200)
            {
                var allText = xmlhttp.responseText;
                var array = JSON.parse(allText);
                for (var i = 0; i < array.length; i++) {
                    // var fileImage = preloadImages(array[i].url);
                    var fileImage = new Image();
                    fileImage.src = array[i].url;
                    currentImageObject = new MPO_ImageObject();
                    currentImageObject.imageNumber = i;
                    currentImageObject.center = JSON.parse(array[i].center);
                    currentImageObject.scale = array[i].scale;
                    currentImageObject.opacity = 0.7;
                    currentImageObject.title = array[i].title;
                    currentImageObject.inputFileName = array[i].url;
                    currentImageObject.fileImage = fileImage;
                    currentImageObject.indexInDB = array[i].id;
                    // currentImageObject.displayNewImage(200);
                    imagesOnMap[i] = currentImageObject;
                    displayList(array[i].url, i);
                    // displayImages(array[i].url, array[i].extent);
                }
            }
            else
            {
                var allText = xmlhttp.responseText;
            }
        }
    }
    xmlhttp.send();
}

function writeArticle(file){
    var xmlhttp = new XMLHttpRequest();
    var url = "/images.json"
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function ()
    {
        if(xmlhttp.readyState === 4)
        {
            if(xmlhttp.status === 201)
            {
                var allText = xmlhttp.responseText;
                console.log("status =  " + xmlhttp.status + " text = "  + allText);
            }
            else
            {
                var allText = xmlhttp.responseText;
                console.log("status =  " + xmlhttp.status + " text = "  + allText)
            }
        }
    }
    xmlhttp.send(JSON.stringify(file));
}

function deleteArticle(i) {
	if (confirm("Do you really want to delete this image?")) {
        var index = imagesOnMap[i].indexInDB;
        var xmlhttp = new XMLHttpRequest();
        var url = "/images/" + index + ".json"
        xmlhttp.open("DELETE", url, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 204) {
                    var allText = xmlhttp.responseText;
                    console.log("status =  " + xmlhttp.status + " text = "  + allText);
                    //TODO delete this image in imageonmap array
                    $('#imageDiv' + i).hide();
                }
                else {
                    var allText = xmlhttp.responseText;
                    console.log("status =  " + xmlhttp.status + " text = "  + allText);
                }
            }
        }
        xmlhttp.send();
    }
}

function displayList(url, imageNumber) {
    parentMapDiv = $("#mapImages_Images")[0];
    newDiv = document.createElement('div');
    newDiv.setAttribute('id', 'imageDiv' + imageNumber);
    newDiv.className = 'overlayImageDiv';
    parentMapDiv.appendChild(newDiv);

    newImageDiv = document.createElement('div');
    newImageDiv.className = "overlayImageDiv_Image";
    newImageDiv.innerHTML = '<img src='+ url +' height="60px" id="filePreview' + imageNumber + '" />';
    newDiv.appendChild(newImageDiv);

    newInfoDiv = document.createElement('div');
    newInfoDiv.className = "overlayImageDiv_Info";

    newInfoDiv.innerHTML = "<p id='imageTitle" + imageNumber + "'> </p>";
    newInfoDiv.innerHTML += '<p><input type="button" value="Edit" onClick="showImageControlPanel('+ imageNumber + ')" />'
   + '<input type="button" value="Delete" onClick="deleteArticle('+ imageNumber + ')" /> </p>';

    newDiv.appendChild(newInfoDiv);

    document.getElementById("filePreview"+imageNumber).src = currentImageObject.fileImage.src;
    document.getElementById("imageTitle"+imageNumber).innerHTML = "Title: " + currentImageObject.title;
}

function editArticle(file, i) {
	var index = imagesOnMap[i].indexInDB;
	var xmlhttp = new XMLHttpRequest();
	var url = "/images/" + index + ".json"
	xmlhttp.open("PATCH", url, true);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 202) {
				var allText = xmlhttp.responseText;
                console.log("status =  " + xmlhttp.status + " text = "  + allText);
            }
			else {
				var allText = xmlhttp.responseText;
                console.log("status =  " + xmlhttp.status + " text = "  + allText);
            }
		}
	}
	xmlhttp.send(JSON.stringify(file));
}

function preloadImages(filename, center) {
    var fileImage = new Image();
    fileImage.src = filename;
    // currentImageObject = new MPO_ImageObject();
    // document.getElementById("newOpacity").value = 70;
    // document.getElementById("newSize").value = 50;
    // fileImage.onload = function(event) {
    //     document.getElementById("filePreview").src = fileImage.src;
    //     $("#imageFileSource")[0].value = filename;
    //     currentImageObject.setInputFileName(filename);
    //     currentImageObject.setFileImage(fileImage);
    //     currentImageObject.displayNewImage(200);
    // }
    return fileImage;
}