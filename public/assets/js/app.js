var map, featureList, tpsSearch = [], ruteSearch = [], pekanbaruSearch = [];

$(window).resize(function () {
	sizeLayerControl();
});

$(document).on("click", ".feature-row", function (e) {
	$(document).off("mouseout", ".feature-row", clearHighlight);
	sidebarClick(parseInt($(this).attr("id"), 10));
});

if (!("ontouchstart" in window)) {
	$(document).on("mouseover", ".feature-row", function (e) {
		highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
	});
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function () {
	$("#aboutModal").modal("show");
	$(".navbar-collapse.in").collapse("hide");
	return false;
});

$("#legend-btn").click(function () {
	$("#legendModal").modal("show");
	$(".navbar-collapse.in").collapse("hide");
	return false;
});

$("#login-btn").click(function () {
	$("#loginModal").modal("show");
	$(".navbar-collapse.in").collapse("hide");
	return false;
});

$("#list-btn").click(function () {
	animateSidebar();
	return false;
});

$("#nav-btn").click(function () {
	$(".navbar-collapse").collapse("toggle");
	return false;
});

$("#sidebar-toggle-btn").click(function () {
	animateSidebar();
	return false;
});

$("#sidebar-hide-btn").click(function () {
	animateSidebar();
	return false;
});

function animateSidebar() {
	$("#sidebar").animate({
		width: "toggle"
	}, 350, function () {
		map.invalidateSize();
	});
}

function sizeLayerControl() {
	$(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
	highlight.clearLayers();
}

function sidebarClick(id) {
	var layer = markerClusters.getLayer(id);
	map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
	layer.fire("click");
	/* Hide sidebar and go to the map on small screens */
	if (document.body.clientWidth <= 767) {
		$("#sidebar").hide();
		map.invalidateSize();
	}
}

function syncSidebar() {
	/* Empty sidebar features */
	$("#feature-list tbody").empty();
	/* Loop through theaters layer and add only features which are in the map bounds */
	/*tps.eachLayer(function (layer) {
		if (map.hasLayer(tpsLayer)) {
			if (map.getBounds().contains(layer.getLatLng())) {
				$("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="../assets/images/bin.png"></td><td class="feature-name">' + layer.feature.properties.nama + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
			}
		}
	});*/
	/* Update list.js featureList */
	featureList = new List("features", {
			valueNames: ["feature-name"]
		});
	featureList.sort("feature-name", {
		order: "asc"
	});
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
	});
var googleMap = L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3'],
    attribution: "Provided by Google Maps"
});
	var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
				maxZoom: 15,
			}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
				minZoom: 16,
				maxZoom: 19,
				layers: "0",
				format: 'image/jpeg',
				transparent: true,
				attribution: "Aerial Imagery courtesy USGS"
			})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
	stroke: false,
	fillColor: "#00FFFF",
	fillOpacity: 0.7,
	radius: 10
};

var kecamatanColors = {
	"Bukit Raya": "rgba(210,199,72,1.0)",
	"Lima Puluh": "rgba(130,233,209,1.0)",
	"Marpoyan Damai": "rgba(46,187,230,1.0)",
	"Payung Sekaki": "rgba(132,116,220,1.0)",
	"Pekanbaru": "rgba(218,63,63,1.0)",
	"Rumbai": "rgba(107,214,139,1.0)",
	"Rumbai Pesisir": "rgba(162,218,72,1.0)",
	"Sail": "rgba(221,112,212,1.0)",
	"Senapelan": "rgba(121,151,219,1.0)",
	"Sukajadi": "rgba(204,156,117,1.0)",
	"Tampan": "rgba(89,222,62,1.0)",
	"Tenayan Raya": "rgba(159,78,209,1.0)"
};

/** fungsi untuk style kelurahan dikategorikan ke kecamatan
 */
function style_kelurahan(feature) {
	return {
		opacity: 1,
		color: 'rgba(0,0,0,0.1)',
		dashArray: '',
		lineCap: 'butt',
		lineJoin: 'miter',
		weight: 1.0,
		fillOpacity: 0.2,
		fillColor: kecamatanColors[feature.properties['Kecamatan']]
	};
}

var pekanbaru = L.geoJson(null, {
		style: style_kelurahan,
		onEachFeature: function (feature, layer) {
			pekanbaruSearch.push({
				name: layer.feature.properties.Kelurahan, //sesuaikan ini dengan nama di JSON kita
				source: "Kelurahan",
				id: L.stamp(layer),
				bounds: layer.getBounds()
			});
			//tampilkan modal kalau kelurahan di click
			if (feature.properties) {
				var content = "<table class='table table-striped table-bordered table-condensed'>"
					 + "<tr><th>Kelurahan</th><td>" + feature.properties.Kelurahan + "</td></tr>"
					 + "<tr><th>Kecamatan</th><td>" + feature.properties.Kecamatan + "</td></tr>"
					 + "<tr><th>Luas</th><td>" + feature.properties.luas_ha + " ha</td></tr>"
					 + "<table>";
				layer.on({
					click: function (e) {
						//untuk sementara, judulnya digunakan Kelurahan saja, sesuaikan dengan JSON
						$("#feature-title").html(feature.properties.Kelurahan);
						//timpa keterangan dengan content kita
						$("#feature-info").html(content);
						$("input#form_id_tps").val(lat + " # " + lng);
						$("input#form_id_kec").val(feature.properties.Kecamatan)
						$("input#form_id_kel").val(feature.properties.Kelurahan)
						$("#span_id_tps").html(lat + " , " + lng);
						$("#span_id_kec").html(feature.properties.Kecamatan)
						$("#span_id_kel").html(feature.properties.Kelurahan)
						//tampilkan
						$("#featureModal").modal("show");

					}
				});
			}

		}
	});
$.getJSON("../data/kelurahan.php", function (data) {
	pekanbaru.addData(data);
});


map = L.map("map", {
		zoom: 10,
		center: [0.54, 101.5],
		layers: [cartoLight, pekanbaru],
		zoomControl: false,
		attributionControl: false
	});

/* Layer control listeners that allow for a single markerClusters layer
map.on("overlayadd", function (e) {
	if (e.layer === tpsLayer) {
		markerClusters.addLayer(tps);
		syncSidebar();
	}
});

map.on("overlayremove", function (e) {
	if (e.layer === tpsLayer) {
		markerClusters.removeLayer(tps);
		syncSidebar();
	}
});
*/
/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
	syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function (e) {
	highlight.clearLayers();
});

map.on("mousemove", function (ev) {
	lat = ev.latlng.lat;
	lng = ev.latlng.lng;
});

/* Attribution control */
function updateAttribution(e) {
	$.each(map._layers, function (index, layer) {
		if (layer.getAttribution) {
			$("#attribution").html((layer.getAttribution()));
		}
	});
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
		position: "bottomright"
	});
attributionControl.onAdd = function (map) {
	var div = L.DomUtil.create("div", "leaflet-control-attribution");
	div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
	return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
		position: "bottomright"
	}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
		position: "bottomright",
		drawCircle: true,
		follow: true,
		setView: true,
		keepCurrentZoomLevel: true,
		markerStyle: {
			weight: 1,
			opacity: 0.8,
			fillOpacity: 0.8
		},
		circleStyle: {
			weight: 1,
			clickable: false
		},
		icon: "fa fa-location-arrow",
		metric: false,
		strings: {
			title: "My location",
			popup: "You are within {distance} {unit} from this point",
			outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
		},
		locateOptions: {
			maxZoom: 18,
			watch: true,
			enableHighAccuracy: true,
			maximumAge: 10000,
			timeout: 10000
		}
	}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
	var isCollapsed = true;
} else {
	var isCollapsed = false;
}

var baseLayers = {
	"OpenStreetMap": cartoLight,
	"Google Maps": googleMap
};

var groupedOverlays = {
	/*"Legenda": {
		"<img src='../assets/images/bin.png' width='24' height='28'>&nbsp;TPS": tpsLayer
	},*/
	"Referensi": {
		"Kelurahan": pekanbaru
	}
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
		collapsed: isCollapsed
	}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
	$(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
	if (e.which == 13) {
		e.preventDefault();
	}
});

$("#featureModal").on("hidden.bs.modal", function (e) {
	$(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
	$("#loading").hide();
	sizeLayerControl();
	map.fitBounds(pekanbaru.getBounds());
	featureList = new List("features", {
			valueNames: ["feature-name"]
		});
	featureList.sort("feature-name", {
		order: "asc"
	});

	var geonamesBH = new Bloodhound({
			name: "GeoNames",
			datumTokenizer: function (d) {
				return Bloodhound.tokenizers.whitespace(d.name);
			},
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
				filter: function (data) {
					return $.map(data.geonames, function (result) {
						return {
							name: result.name + ", " + result.adminCode1,
							lat: result.lat,
							lng: result.lng,
							source: "GeoNames"
						};
					});
				},
				ajax: {
					beforeSend: function (jqXhr, settings) {
						settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
						$("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
					},
					complete: function (jqXHR, status) {
						$('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
					}
				}
			},
			limit: 10
		});
	geonamesBH.initialize();

	/* instantiate the typeahead UI */
	$("#searchbox").typeahead({
		minLength: 3,
		highlight: true,
		hint: false
	}, {
		name: "GeoNames",
		displayKey: "name",
		source: geonamesBH.ttAdapter(),
		templates: {
			header: "<h4 class='typeahead-header'><img src='../assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
		}
	}).on("typeahead:selected", function (obj, datum) {
		
		if (datum.source === "GeoNames") {
			map.setView([datum.lat, datum.lng], 14);
		}
		if ($(".navbar-collapse").height() > 50) {
			$(".navbar-collapse").collapse("hide");
		}
	}).on("typeahead:opened", function () {
		$(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
		$(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
	}).on("typeahead:closed", function () {
		$(".navbar-collapse.in").css("max-height", "");
		$(".navbar-collapse.in").css("height", "");
	});
	$(".twitter-typeahead").css("position", "static");
	$(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
/*var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
	L.DomEvent
	.disableClickPropagation(container)
	.disableScrollPropagation(container);
} else {
	L.DomEvent.disableClickPropagation(container);
}*/