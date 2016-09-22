var MapboxClient = require('mapbox/lib/services/datasets');
var dataset = 'citd4ic0i006v2smigzc46pyh';
var DATASETS_BASE = 'https://api.mapbox.com/datasets/v1/planemad/' + dataset + '/';
var mapboxAccessDatasetToken = 'sk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiY2l0ZDRrNzJoMDA3cDJvcDdxdXVsdTR3bSJ9.qSu4wFJlTpzGaBaxrs2sMA';
var mapbox = new MapboxClient(mapboxAccessDatasetToken);

var reviewer;
var _tmp = {};

mapboxgl.accessToken = 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/planemad/cip0m8hzf0003dhmh432q7g2k', //stylesheet location
    center: [4.3618,50.8480], // starting position
    zoom: 16, // starting zoom
    hash: true
});

var geolocate = map.addControl(new mapboxgl.Geolocate({
    position: 'bottom-right'
}));
map.addControl(new mapboxgl.Navigation());


// Layer for review markers
var overlayDataSource = new mapboxgl.GeoJSONSource({
    data: {}
});

var overlayData = {
    'id': 'overlayData',
    'type': 'circle',
    'source': 'overlayDataSource',
    'interactive': true,
    'layout': {
        visibility: 'visible'
    },
    'paint': {
        'circle-radius': 15,
        'circle-color': '#5deb5e',
        'circle-blur': .9
    }
};

// Map ready
map.on('style.load', function(e) {
    init();


    function init() {

        map.addSource('overlayDataSource', overlayDataSource);
        map.addLayer(overlayData);
        getOverlayFeatures();

        map.on('click', function(e) {

            // Add review marker
            var newOverlayFeature = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "coordinates": [

                    ],
                    "type": "Point"
                }
            };

            var clickedOverlayFeatures = map.queryRenderedFeatures([
                [e.point.x - 5, e.point.y - 5],
                [e.point.x + 5, e.point.y + 5]
            ], {
                layers: ['overlayData']
            });
            if (clickedOverlayFeatures.length) {
                overlayFeatureForm(clickedOverlayFeatures[0]);

            } else {
                overlayFeatureForm();
            }

            function overlayFeatureForm(feature) {
                  var formOptions = "<div class='radio-pill pill pad1y clearfix'><input id='valid' type='radio' name='review' value='tree' checked='checked'><label for='tree' class='short button icon check fill-green'>Safe</label><input id='sapling' type='radio' name='review' value='sapling'><label for='sapling' class='short button icon check fill-red'>Danger</label></div>";
                var formReviewer = "<fieldset><label>Reported by: <span id='reviewer' style='padding:5px;background-color:#eee'></span></label><input type='text' name='reviewer' placeholder='name'></input></fieldset>"
                var popupHTML = "<form>" + formOptions + formReviewer + "<a id='updateOverlayFeature' class='button col4' href='#'>Save</a><a id='deleteOverlayFeature' class='button quiet fr col4' href='#' style=''>Delete</a></form>";
                var popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupHTML)
                    .addTo(map);

                // Show existing status if available
                if (feature) {
                    $("input[name=review][value=" + feature.properties["natural"] + "]").prop('checked', true);
                    $("#reviewer").html(feature.properties["contributed_by"]);
                    newOverlayFeature = feature;
                    newOverlayFeature["id"] = feature.properties["id"];
                    console.log(feature);
                } else {
                    newOverlayFeature.geometry.coordinates = e.lngLat.toArray();
                }

                // Set reviewer name if previously saved
                if (reviewer) {
                    $("input[name=reviewer]").val(reviewer);
                }

                // Update dataset with feature status on clicking save
                document.getElementById("updateOverlayFeature").onclick = function() {
                    newOverlayFeature.properties["natural"] = $("input[name=review]:checked").val();
                    reviewer = $("input[name=reviewer]").val();
                    newOverlayFeature.properties["contributed_by"] = reviewer;
                    popup.remove();
                    mapbox.insertFeature(newOverlayFeature, dataset, function(err, response) {
                        console.log(response);
                        overlayFeatureCollection.features = overlayFeatureCollection.features.concat(response);
                        overlayDataSource.setData(overlayFeatureCollection);
                    });
                };
                // Delete feature on clicking delete
                document.getElementById("deleteOverlayFeature").onclick = function() {
                    popup.remove();
                    mapbox.deleteFeature(newOverlayFeature["id"], dataset, function(err, response) {
                        console.log(response);
                    });
                };
            }

        });

    }


    // Get data from a Mapbox dataset
    var overlayFeatureCollection = {
        'type': 'FeatureCollection',
        'features': []
    };

    function getOverlayFeatures(startID) {

        var url = DATASETS_BASE + 'features';
        var params = {
            'access_token': mapboxAccessDatasetToken
        };

        // Begin with the last feature of previous request
        if (startID) {
            params.start = startID;
        }

        $.getJSON(url, params, function(data) {

            console.log(data);

            if (data.features.length) {
                data.features.forEach(function(feature) {
                    // Add dataset feature id as a property
                    feature.properties.id = feature.id;
                });
                overlayFeatureCollection.features = overlayFeatureCollection.features.concat(data.features);
                var lastFeatureID = data.features[data.features.length - 1].id;
                getOverlayFeatures(lastFeatureID);
                overlayDataSource.setData(overlayFeatureCollection);
            }
            overlayDataSource.setData(overlayFeatureCollection);
        });
    }

});
