
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
    readMapFile("bermuda.json");
  preLoad();
    dropDownPre();
});

var myMap;
var data;
var hasDrawLayer = false;
var hasSelectLayer = false;
var numOfLayer = 0;

//for loading from localstorage
var keys = [];

function preLoad(){
  document.getElementById("inverse").onchange = reloadAllPic;
  document.getElementById("swipe").onchange = swiper;
  document.getElementById("swipeOF").onchange = swiperOff;
  $("#collapse").on("change","input",function() {
    changeMapRadio()
  });
  $("#collapse1").on("change", "input", function () {
    togglePicture(1);
  })
  $(".slider").on("input", function(){
    changeImageOpacity(0, this.value);
  });

  document.getElementById("draw").onclick = beginDraw;
  $('#display')[0].onclick = displayCoord;
  $('#select')[0].onclick = selectLine;
  $('#delete')[0].onclick = removeSelectedFeature;
  $('#file')[0].onclick = saveToFile;

  $('#mapInfoCheck')[0].onchange = function () {
    if (this.checked)
    $("#information").show();
    else
    $("#information").hide();
  }
  $('#mapCheck')[0].onchange = function () {
    if (this.checked)
    $("#collapse").show();
    else
    $("#collapse").hide();
  }
  $("#collapseSwiper").hide();
}

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function saveToFile() {
  if (displayCoord() === true) {
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "data.csv");
  }
}

function dropDownPre() {
    if (localStorage.getItem("keys")!= null){
        keys = JSON.parse(localStorage.getItem("keys"));
    }
    keys.forEach(function (name) {
        $('#myDropdown')[0].innerHTML += "<a href='#'  onclick= loadAll('"+ name +"') >" + name + "</a>";
    })
}

function deleteAll() {
  myMap.deleteAllFeatures();
}

function saveAll() {
  myMap.saveAllFeatures()
}

function loadAll(name) {
  myMap.loadAllFeatures(name);
}

function showDrop() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function swiper(){
  var swipe = document.getElementById('swipe');
  myMap.picSwiper(swipe);
}

function swiperOff() {
  if (!$('#swipeOF')[0].checked){
    $("#collapseSwiper").hide();
    reloadAllPic();
  }
  else{
    $("#collapseSwiper").show();
  }
}

function beginDraw() {
  if (hasDrawLayer === false) {
    if (hasSelectLayer === true) {
      hasSelectLayer = false;
      myMap.removeSelectLine();
    }
    else{
      hasDrawLayer = true;
    }
    myMap.drawLine();
    closeNav();
  }
  else{
    hasDrawLayer = false;
    myMap.removeDrawLine();
  }
}

function selectLine(){
  if (hasSelectLayer === false) {
    if (hasDrawLayer === true) {
      hasDrawLayer = false;
    }
    alert("After select one line, click delete on the side bar to delete the line.");
    hasSelectLayer = true;
    myMap.selectLine();
    closeNav();
  }
  else{
    hasSelectLayer = false;
    myMap.removeSelectLine();
  }
}

function removeSelectedFeature() {
  myMap.deleteFeature();
  myMap.removeSelectLine();
  myMap.selectLine();
}

function displayCoord() {
  return myMap.getCoord();
}

function reloadAllPic(){
  myMap.reloadAllPic();
}

function changeImageOpacity(section, value) {
  document.getElementById("range").innerHTML = value;
  myMap.changeOpacity(section, value/100);
}

function changeMapRadio() {
  var mapRadio = document.getElementsByName("base");
  for (var i = 0; i < mapRadio.length; i++){
    if (mapRadio[i].checked){
      myMap.changeMap(mapRadio[i].value);
    }
  }
}

function removeMap(index) {
  var curr = document.getElementById("checkbox" + index);
  if (!curr.checked) {
    $('#collapse'+index).hide();
    var pictures = document.getElementsByName('picGroup' + index);
    document.getElementById('newOpacity' + index).value = 100;
    for (var i = 0; i < pictures.length; i++) {
      document.getElementById("picture"+index+"Form" + i).disabled = false;
    }
    myMap.changePicture(index - 1, -1);
  }
  else{
    $('#collapse'+index).show();
    if (index - 1 === numOfLayer) {
      var div = document.createElement("div");
      var currIndex = index + 1;
      div.setAttribute("id", "pictureMap" + currIndex);
      div.innerHTML += "<h5><b>Select image map</b>"
      div.innerHTML += '<label class="switch"><input type="checkbox" id = "checkbox'+currIndex+'"  onchange = "removeMap('+ currIndex +')">><div class="slider round"></div></label></h5>';
      div.innerHTML += '<div id="collapse'+currIndex+'" value = '+currIndex+'></div>';
      div.innerHTML += '<div class="opacity1"><h6><b>Opacity</b><input class="slider" type="range" id="newOpacity'+ currIndex + '" value="100" min="0" max="100" section = "'+currIndex+'"/><span class="tooltiptext" id="range">100</span></h6></div>'
      ;            $('#Form')[0].appendChild(div);
      $('#collapse'+currIndex).hide();
      produceRadio(picturesInfo, currIndex);
      var selector = '#collapse' + currIndex;
      $('#collapse' + currIndex).on("change", "input", function () {
        togglePicture(parseInt(this.parentElement.parentElement.getAttribute('value')));
      })
      $(".slider").on("input", function(){
        changeImageOpacity(parseInt(this.getAttribute("section") - 1), this.value);
      });
      var pictures = document.getElementsByName('picGroup' + 1);
      var thisPictures = document.getElementsByName('picGroup' + currIndex);
      for (var m = 0;m < pictures.length; m++){
        if (pictures[m].disabled){
          thisPictures[m].disabled = true;
        }
        else if (pictures[m].checked === true){
          thisPictures[m].disabled = true;
        }
      }
      numOfLayer++;
    }
  }
}

function togglePicture(index) {
  var pictures = document.getElementsByName('picGroup' + index);
  for (var i=0;i<pictures.length;i++) {
    if (pictures[i].checked) {
      myMap.changePicture(index - 1, i);
      document.getElementById('newOpacity' + index).value=100;
      for (var j = 1; j <= numOfLayer + 1; j++){
        if (j != index){
          document.getElementById("picture" + j + "Form" + i).checked = false;
          document.getElementById("picture" + j + "Form" + i).disabled = true;
        }
      }
    }
    else{
      for (var j = 1; j <= numOfLayer + 1; j++){
        if (j != index){
          document.getElementById("picture" + j + "Form" + i).disabled = false;
        }
      }
    }
  }
}

function viewerMap(tiles, mapArray, pictureTilesArray, pictureArray){
  var selectPicture = new Array(2);
  var currMap = 0;
  var currPic = new Array(2);
  currPic[0] = -1;
  currPic[1] = -1;
  var currSwipe = -1;
  selectPicture[0]  = null;
  selectPicture[1] = null;
  container = 'map'
  var baseMap = new ol.Map({
    target: 'map',
    layers: tiles[0],
    view: new ol.View({
      center: ol.proj.transform([-64.766667, 32.283333], 'EPSG:4326', 'EPSG:3857'),
      zoom: 12,
      // extent:  ol.proj.transformExtent([-77.14, 39.75, -77.26, 39.90],  'EPSG:4326', 'EPSG:3857'),
      // maxZoom: 18.0,
      // minZoom: 12.0
    })
  });
  document.getElementById("mapInfo").innerHTML = mapArray[currMap][0].description;

  this.changeMap = function (layer) {
    document.getElementById("mapInfo").innerHTML = mapArray[layer][0].description;
    var layers=baseMap.getLayers().getArray();
    var length=layers.length;
    currMap = layer;
    for (var i = 0; i < length; i++) {
      baseMap.removeLayer(layers[0]);
    }
    for (var a = 0; a < tiles[layer].length; a++){
      baseMap.addLayer(tiles[layer][a]);
    }
    for (var i = 0; i < selectPicture.length; i++) {
      if (selectPicture[i] !== null) {
        baseMap.addLayer(selectPicture[i]);
      }
    }
    if (vector != null) {
      baseMap.removeLayer(vector);
      baseMap.addLayer(vector);
    }
  }

  this.reloadAllPic = function(){
    pictureTilesArray = parseToArrayPic(pictureArray);
    for (var i = 0; i < selectPicture.length; i++){
      baseMap.removeLayer(selectPicture[i]);
    }
    for (var k = 0; k < selectPicture.length; k++) {
      if (currPic[k] >= 0){
        baseMap.addLayer(pictureTilesArray[currPic[k]]);
        selectPicture[k] = pictureTilesArray[currPic[k]];
      }
    }
  }

  this.getbaseMap = function() {
    return myMap;
  }

  this.changeOpacity = function(section, opacity) {
    if (selectPicture[section] != null){
      selectPicture[section].setOpacity(opacity);
    }
  }

  this.changePicture = function(section, picNum) {
    if (picNum === -1) {
      baseMap.removeLayer(selectPicture[section]);
      selectPicture[section] = null;
      document.getElementById("picInfo2").innerHTML = "";
    }
    else {
      for (var j = 0; j < selectPicture.length; j++) {
        if (selectPicture[j] != null) {
          baseMap.removeLayer(selectPicture[j]);
        }
      }
      selectPicture[section] = pictureTilesArray[picNum];
      for (var k = 0; k < selectPicture.length; k++) {
        if (selectPicture[k] != null) {
          baseMap.addLayer(selectPicture[k]);
        }
      }
      selectPicture[section].setOpacity(100);
      if (section === 0) {
        currPic[0] = picNum;
        document.getElementById("picInfo1").innerHTML = pictureArray[picNum].description;
      }
      else {
        currPic[1] = picNum;
        document.getElementById("picInfo2").innerHTML = pictureArray[picNum].description;
      }
      if (vector != null) {
        baseMap.removeLayer(vector);
        baseMap.addLayer(vector);
      }
    }
  }
  //picture swiper
  this.picSwiper = function (swipe) {
    var inverse = document.getElementById("inverse");
    if (selectPicture[0] !== null || selectPicture[1] !== null){
      if (selectPicture[1] !== null){
        if (currSwipe === 0){
          pictureTilesArray = parseToArrayPic(pictureArray);
          for (var i = 0; i < selectPicture.length; i++){
            baseMap.removeLayer(selectPicture[i]);
          }
          for (var k = 0; k < selectPicture.length; k++) {
            if (k === 0){
              baseMap.addLayer(pictureTilesArray[currPic[0]]);
            }
            else if (selectPicture[k] != null) {
              baseMap.addLayer(selectPicture[k]);
            }
          }
        }
        currSwipe = 1;
        pictureSwipeLayer = selectPicture[1];
      }
      else{
        if (currSwipe === 1){
          pictureTilesArray = parseToArrayPic(pictureArray);
          for (var i = 0; i < selectPicture.length; i++){
            baseMap.removeLayer(selectPicture[i]);
          }
          for (var k = 0; k < selectPicture.length; k++) {
            if (k === 1){
              baseMap.addLayer(pictureTilesArray[currPic[1]]);
            }
            else if (selectPicture[k] != null) {
              baseMap.addLayer(selectPicture[k]);
            }
          }
        }
        currSwipe = 0;
        pictureSwipeLayer = selectPicture[0];
      }
      if (inverse.checked){
        pictureSwipeLayer.addEventListener('precompose', function(event) {
          var ctx = event.context;
          var width = ctx.canvas.width * (swipe.value / 100);
          ctx.save();
          ctx.beginPath();
          ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
          ctx.clip();
        });
      }
      else{
        pictureSwipeLayer.addEventListener('precompose', function(event) {
          var ctx = event.context;
          var width = ctx.canvas.width * (swipe.value / 100);
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, width, ctx.canvas.height);
          ctx.clip();
        });
      }

      pictureSwipeLayer.on('postcompose', function(event) {
        var ctx = event.context;
        ctx.restore();
      });

      swipe.addEventListener('input', function() {
        baseMap.render();
      }, false);
    }
  }

  //add Feature of draw a line and print the two point of line
  var draw;
  var vector;
  var source;
  var initialized = false;
  this.drawLine = function(){
    if (!initialized) {
      var type = "LineString";
      var featureID = 0;
      var styleFunction = function (feature) {
        var geometry = feature.getGeometry();
        var styles = [
          // linestring
          new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#ff0000',
              width: 3
            })
          })
        ];
        geometry.forEachSegment(function(start, end) {
          var dx = end[0] - start[0];
          var dy = end[1] - start[1];
          var rotation = Math.atan2(dy, dx);
          styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(end),
            image: new ol.style.Icon({
              src: 'arrow.png',
              anchor: [0.75, 0.5],
              rotateWithView: true,
              rotation: -rotation
            })
          }));
        });

        return styles;
      };
      // vectorlayer for line feature
      source = new ol.source.Vector({wrapX: false});
      vector = new ol.layer.Vector({
        source: source,
        style: styleFunction
      });
      baseMap.addLayer(vector);

      //get the geometry information
      function addInteraction() {
        var value = type;
        if (value !== 'None') {
          draw = new ol.interaction.Draw({
            source: source,
            type: /** @type {ol.geom.GeometryType} */ (type),
            maxPoints: 2,
            minPoints: 2
          });
          //add id onto features
          draw.on('drawend', function (event) {
            featureID = featureID + 1;
            event.feature.setProperties({
              'id': featureID
            });
          });
          baseMap.addInteraction(draw);
        }
      }
      addInteraction();
      initialized = true;
    }
    else{
      baseMap.addInteraction(draw);
    }
  }
  this.removeDrawLine = function() {
    baseMap.removeInteraction(draw);
  }

  var singleClick = new ol.interaction.Select();
  var selectedFeatureID;
  var modifyFeature;
  this.selectLine = function () {
    // https://gis.stackexchange.com/questions/126909/remove-selected-feature-openlayers-3
    baseMap.removeInteraction(draw);
    singleClick = new ol.interaction.Select();
    baseMap.addInteraction(singleClick);

    singleClick .getFeatures().on('add', function (event) {
      var properties = event.element.getProperties();
      selectedFeatureID = properties.id;
    });

    var features = singleClick .getFeatures();
    var modify = new ol.interaction.Modify({
      features: features,
      //press shift to delete line
      deleteCondition: function(event) {
        return ol.events.condition.shiftKeyOnly(event) &&
        ol.events.condition.singleClick(event);
      }
    });
    baseMap.addInteraction(modify);
    modifyFeature = modify;
  }

  this.removeSelectLine = function () {
    baseMap.removeInteraction(singleClick);
    baseMap.removeInteraction(modifyFeature);
  }

  this.deleteAllFeatures = function () {
    if(vector != null) {
      source.clear();
      alert("Successfully Delete All Lines");
    }
  }

    this.saveAllFeatures = function () {
    var features = source.getFeatures();
    var linesArray = [];
    features.forEach(function (feature) {
      var lineXY = feature.getGeometry().getCoordinates();
      linesArray.push(lineXY)
    });
    var name = prompt("Please enter the name of the set of lines: ", "Default");
    if (!keys.includes(name)) {
        localStorage.setItem(name, JSON.stringify(linesArray));
        alert("Successfully save to LocalStorage");
        keys.push(name);
        localStorage.keys = JSON.stringify(keys);
        $('#myDropdown')[0].innerHTML += "<a href='#'  onclick= loadAll('"+ name +"') >" + name + "</a>";
    }
    else{
      if (confirm("Name already exist, do you want to update the data?")){
          localStorage.setItem(name, JSON.stringify(linesArray));
      }
      else{
        alert("Fail to save data.")
      }
    }
  }

  this.loadAllFeatures = function (name) {
    var name = localStorage.getItem(name);
    if (name != null) {
      var linesArray = JSON.parse(name);
      if (!initialized) {
        var type = "LineString";
        var featureID = 0;
        var styleFunction = function (feature) {
          var geometry = feature.getGeometry();
          var styles = [
            // linestring
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 3
              })
            })
          ];
          geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            // arrows
            styles.push(new ol.style.Style({
              geometry: new ol.geom.Point(end),
              image: new ol.style.Icon({
                src: 'arrow.png',
                anchor: [0.75, 0.5],
                rotateWithView: true,
                rotation: -rotation
              })
            }));
          });
          return styles;
        };
        // vectorlayer for line feature
        source = new ol.source.Vector({wrapX: false});
        vector = new ol.layer.Vector({
          source: source,
          style: styleFunction
        });
        baseMap.addLayer(vector);
        initialized = true;
      }
      linesArray.forEach(function (line) {
        var lineFeature = new ol.Feature(new ol.geom.LineString([line[0], line[1]]));
        source.addFeature(lineFeature);
      });
      alert("Successfully loaded temporarily saved data.");
    }
    else{
      alert("You have not save any data.");
    }
  }

  this.getCoord = function () {
    if (vector !=null) {
      document.getElementById('myModal').style.display = "block";
      // Get the array of features
      var features = vector.getSource().getFeatures();

      // Go through this array and get coordinates of their geometry.
      // $('#data')[0].innerHTML = "";
      var table = $('#table')[0];
      table.innerHTML = "";
      var row = table.createTHead().insertRow(0);
      row.insertCell(0).innerHTML = "<b>Distance</b>";
      row.insertCell(1).innerHTML = "<b>Angle</b>";
      row.insertCell(2).innerHTML = "<b>Start Longitude</b>";
      row.insertCell(3).innerHTML = "<b>Start Latitude</b>";
      row.insertCell(4).innerHTML = "<b>End Long</b>";
      row.insertCell(5).innerHTML = "<b>End Lat</b>";

      data = "distance,angle,startLon,startLat,endLon,endLat\r";
      features.forEach(function (feature) {
        var lineXY = feature.getGeometry().getCoordinates();
        var start = ol.proj.transform(lineXY[0], 'EPSG:3857', 'EPSG:4326');
        var end = ol.proj.transform(lineXY[1], 'EPSG:3857', 'EPSG:4326');
        var distance = getDistance(start[0], start[1], end[0], end[1]);
        var angle = getAngle(start[0], start[1], end[0], end[1]);
        var row = table.insertRow();
        row.insertCell(0).innerHTML = distance;
        row.insertCell(1).innerHTML = angle * (180/Math.PI);
        row.insertCell(2).innerHTML = start[0];
        row.insertCell(3).innerHTML = start[1];
        row.insertCell(4).innerHTML = end[0];
        row.insertCell(5).innerHTML = end[1];
        data += distance + "," + angle*(180/Math.PI) + "," + start[0] + "," + start[1]+ "," + end[0]+ "," + end[1]+ "\r";
      });
      return true;
    }
    else{
      alert("You have not drawn any line.");
      return false;
    }
  }
  this.deleteFeature = function () {
    var features = source.getFeatures();
    if (features != null && features.length > 0) {
      for (x in features) {
        var properties = features[x].getProperties();
        var id = properties.id;
        if (id == selectedFeatureID) {
          source.removeFeature(features[x]);
          break;
        }
      }
    }
  }

  return this;
}

function getDistance (lon1, lat1, lon2, lat2){
  var R = 6371e3; // metres
  var radLat1 = toRad(lat1);
  var radLat2 = toRad(lat2);
  var deltaLat = toRad(lat2-lat1);
  var deltaLon = toRad(lon2-lon1);

  var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
  Math.cos(radLat1) * Math.cos(radLat2) *
  Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

function getAngle(lon1, lat1, lon2, lat2) {
  var b = getDistance(lon1, lat1, lon2, lat2);
  var a = getDistance(lon1, lat1, lon1, lat2);
  var c = getDistance(lon2, lat2, lon1, lat2);
  var angleC = Math.acos((b*b + a*a - c*c)/(2*b*a));
  if (lon1 > lon2){
    if (lat1 > lat2){
      //Third
      angleC+=Math.PI;
    }
    else{
      //Forth
      angleC = (Math.PI * 2) - angleC;
    }
  }
  else if (lat1 > lat2){
    //Second
    angleC = Math.PI - angleC;
  }
  else{
    //First
  }
  // var angle = Math.acos((Math.cos(c) - Math.cos(a) * Math.cos(b))/(Math.sin(a) * Math.sin(b)));
  // console.log(angle  * 180 / Math.PI)
  return angleC;
}


function toRad(x) {
  return x * Math.PI / 180;
}

function StamenMap (options) {
  var label = options["label"]
  var tl = new ol.layer.Tile({
    source: new ol.source.Stamen({
      layer: label
    })
  })
  return tl;
}

function XYZMap(options) {
  var myUrl=options["url"]
  var tl=new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: myUrl,
      opacity: true
    })
  })
  return tl;
}

function PictureMap(options) {
  var myUrl = options["url"];
  var myExtent = JSON.parse(options["extent"]);
  var trueTrueExtent = ol.proj.transformExtent(myExtent, 'EPSG:4326','EPSG:3857');
  var t1 = new ol.layer.Image({
    source: new ol.source.ImageStatic({
      url: myUrl,
      opacity: true,
      imageExtent: trueTrueExtent
    })
  })
  return t1;
}

/*
This function reads the object parsed from JSON.  Since JSON does not
maintain the obj.constructor property, I create an instance of the
specific object type (stored in instanceType) and copy the fields
into this new object.  This "effectively" casts the object to the correct
type.
*/
function parseToArrayPic(inputArray) {
  var pictures = new Array();
  var length = inputArray.length;
  for (var i = 0; i<length; i++) {
    pictures[i] = PictureMap(inputArray[i]);
  }
  return pictures;
}

function parseToArrayMap(inputArray) {
  var maps = new Array();
  var len1 = inputArray.length;
  for (var i = 0; i < len1; i++){
    maps[i] = new Array();
    var len2 = inputArray[i].length;
    for (var j = 0; j < len2; j++){
      objType=inputArray[i][j].instanceType;
      maps[i][j] = window[objType](inputArray[i][j]);
    }
  }
  return maps;
}

//TEMPORORAY ARRAY
var mapArray =     [[
        {
            "instanceType":"XYZMap",
            "url":"https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "title": "title of map2",
            "description" : "description of map2",
            "author" : "author of map2"
        }
    ],
    [
        {
            "instanceType":"StamenMap",
            "label": "toner-hybrid",
            "title": "title of map4",
            "description" : "description of map4",
            "author" : "author of map4"
        },
        {
            "instanceType":"StamenMap",
            "label": "toner-labels"
        }
    ]];

function readMapFile(file){
  var xmlhttp = new XMLHttpRequest();
  var url = "/images.json"
  xmlhttp.open("GET", url, true);
  xmlhttp.onreadystatechange = function (){
    if(xmlhttp.readyState === 4){
      if(xmlhttp.status === 200 || xmlhttp.status == 0){
        var allText = xmlhttp.responseText;
        var parsedAllText = JSON.parse(allText);
        console.log(parsedAllText)
        var tiles = parseToArrayMap(mapArray);
        var pictureTilesArray = parseToArrayPic(parsedAllText);
        preLoadRadio(parsedAllText, mapArray);
        myMap = viewerMap(tiles, mapArray, pictureTilesArray, parsedAllText);
      }
    }
  }
  xmlhttp.send();
}

function openNav() {
  document.getElementById("sideNavOpen").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
  document.getElementById("map").style.width = "100%";
  document.getElementById("toolbar").style.display = "none";
  document.getElementById("map").setAttribute;
  document.getElementById("sideNavOpen").style.boxShadow = "20px 30px 40px #303235";
  if (hasDrawLayer){
    hasDrawLayer = false;
    myMap.removeDrawLine();
  }
  else if (hasSelectLayer){
    hasSelectLayer = false;
    myMap.removeSelectLine();
  }
}

function closeNav() {
  document.getElementById("sideNavOpen").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("map").style.width = "95%";
  document.getElementById("toolbar").style.display = "block";
  document.getElementById("map").style.filter = "none";
  document.getElementById("sideNavOpen").style.boxShadow = "none";
  document.getElementById("map").disabled = false;
}

function show_coords(event) {
  var x = event.screenX ;
  var y = event.screenY;
  var coords = "X coords: " + x + ", Y coords: " + y;
  if(x>screen.width*0.25 && hasDrawLayer === false){
    closeNav()
  }
}

function closeModal() {
  document.getElementById('myModal').style.display = "none";
}

function preLoadRadio(pictures, maps) {
  var radioContainerMap = $('#collapse')[0];
  var buttonForm = document.createElement("FORM");
  buttonForm.setAttribute("id", "buttonForm")
  for (var i = 0; i < maps.length; i++) {
    var index = "mapForm" + i;
    if (i === 0){
      var mapRadio = '<input type="radio" name = "base"  value = '+ i +' id = '+ index +' checked> '+ maps[i][0].title +' </br>';
      mapRadio.name = "base";
      buttonForm.innerHTML += mapRadio ;
    }
    else {
      var mapRadio = '<input type="radio"  name = "base"  value = '+ i +' id = '+ index +'> '+ maps[i][0].title +' </br>';
      buttonForm.innerHTML += mapRadio ;
    }
  }
  radioContainerMap.appendChild(buttonForm);
  produceRadio(pictures, 1);
  picturesInfo = pictures;
}
var picturesInfo;
function produceRadio(pictures, index) {
  for (var i = 0; i < pictures.length; i++) {
    var container = document.getElementById("collapse" + index);
    var picture = "picture"+index+"Form" + i;
    var radio = document.createElement("div");
    radio.setAttribute("id", "pictureSelect"+index);
    radio.innerHTML = '<input type="radio" name="picGroup'+index+'" value = '+ i +' id = ' + picture + '> '+ pictures[i].title +' </br>';
    container.appendChild(radio);
  }
}
