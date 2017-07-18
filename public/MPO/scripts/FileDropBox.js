window.onload=function(){
	var mainWindow = document.getElementById('mainWindow');
	mainWindow .addEventListener('dragenter', doNothing, false);
	mainWindow .addEventListener('dragexit', doNothing, false);
	mainWindow .addEventListener('dragover', doNothing, false);
	mainWindow .addEventListener('drop', drop, false);	
    
    var dropbox = document.getElementById('dropbox');
	dropbox.addEventListener('dragenter', doNothing, false);
	dropbox.addEventListener('dragexit', doNothing, false);
	dropbox.addEventListener('dragover', doNothing, false);
	dropbox.addEventListener('drop', drop, false);
}

function doNothing(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}

function drop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	var transferType = evt.dataTransfer.types[0];
	var files = "";
	var filename = "";
	var fileImage = new Image();
	
	if (transferType == "Files" || transferType == "application/x-moz-file"){
		if(evt.dataTransfer.files.length > 1) {
			 alert("Only one file may be specified");
			 return;
		}
		
		filename=evt.dataTransfer.files[0].name;		
		switch(filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()){
			case 'gif': case 'jpg': case 'png': case 'jpeg': 
				break;
			default:
				alert("You must use an image file");
				return;
				break;
		}
			 
		var file = evt.dataTransfer.files[0]
		var reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = function (event) {
			document.getElementById("filePreview").src = reader.result;	
			
			//newObjectImage = new MPO_ImageObject(filename, fileImage);
			//changeImageOnMap(newObjectImage);
			$("#imageFileSource")[0].value = filename;
			currentImageObject.setInputFileName(filename);
			fileImage.src = reader.result;
			currentImageObject.setFileImage(fileImage);
			currentImageObject.displayNewImage(200);			
		};

	}
	
	else if (transferType.search('text') >= 0) {
	
		if (evt.dataTransfer.getData('URL').length != 0){
			filename = evt.dataTransfer.getData("URL");
			switch(filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()){
				case 'gif': case 'jpg': case 'png': case 'jpeg':
					break;
				default:
					alert("You must use an image file");
					return;
					break;
			}				
			
			fileImage.src = filename;
			fileImage.onload = function(event) {
				document.getElementById("filePreview").src = fileImage.src;
				//newObjectImage = new MPO_ImageObject(filename, fileImage, inumber);
				
				//changeImageOnMap(newObjectImage);
				$("#imageFileSource")[0].value = filename;
				currentImageObject.setInputFileName(filename);				
				currentImageObject.setFileImage(fileImage);
				currentImageObject.displayNewImage(200);
			}
		}
		else
			alert("Invalid URL - Please try again");
	}
}
