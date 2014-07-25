$(function () {
    var map = L.map('map', {
        center:new L.LatLng(36, 108),
        zoom:4,
        minZoom:3,
        maxZoom:5,
        zoomControl:false
    });
    L.control.zoom({position:'topright'}).addTo(map);

    function getColor(d) {
        return '#37b48a';
    }

    function style(feature) {
        return {
            fillColor:getColor(feature.properties.code),
            weight:1,
            opacity:1,
            color:'white',
            dashArray:'3',
            fillOpacity:1
        };
    }

    L.geoJson(china, {style:style}).addTo(map);
    

    var markers = [], layerGroup,text = [];
    function processData(lines) {
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var startpoint = line["startPoint"];
            var c = L.circleMarker(startpoint, {"color":"#fff", "fillColor":"#e6b322", "fillOpacity":"0.84", "opacity":"1"}).addTo(map);
            c.setRadius(parseInt(line["weight"]) / 20000);
            c.on('mousemove', function () {
                clearLayers();
                var linetype, endpointinfos, w, d;
                for (var whichpoint = 0; whichpoint < lines.length; whichpoint++) {
                    if (this._latlng.lat == lines[whichpoint]["startPoint"][0] && this._latlng.lng == lines[whichpoint]["startPoint"][1]) {
                        endpointinfos = lines[whichpoint]["endPointInfos"];
                        linetype = lines[whichpoint]["lineType"];
                        w = lines[whichpoint]["weight"];
                        d = lines[whichpoint]["desc"];
                        break;
                    }
                }

                addLinesFromOnePoint(this._latlng, endpointinfos);

                this.setRadius(10);
                $("#line_tuli").show();
                $("#tuli_yuan").show();
                $("#tuli-yuan2").hide();
                $("#news-sum").show();
                $("#news_info").text(d + "-" + w);
            });

            markers.push(c);
            text.push(line["desc"] + "：" + line["weight"] + "<br>");

        }
        text.sort(function (a, b) {
            return parseInt(a.split("：")[1]) < parseInt(b.split("：")[1]) ? 1 : -1
        });
        $("#line_info").html(text);
        L.layerGroup(markers).addTo(map);
    }

    function clearLayers() {
        if (layerGroup) {
            layerGroup.clearLayers();
        }
    }

    function addLinesFromOnePoint(startPoint, pointinfos) {
        var polylines = [], contents = [];

        for (var j = 0; j < pointinfos.length; j++) {

            var endpointinfo = pointinfos[j],
                endpoint = endpointinfo["endPoint"],
                weight = endpointinfo["weight"],
                desc = endpointinfo["desc"],
                lineWidth = group(parseInt(weight)),
                polyline = L.polyline([startPoint, endpoint], {"weight":lineWidth, "color":"#006e55", "fillOpacity":"0.99", "opacity":"0.99"});
            polyline.on("mouseover", function () {
                this.setStyle({"weight":this.options.weight * 2});
            });
            polyline.on("mouseout", function () {
                this.setStyle({"weight":this.options.weight / 2});
            });
            polyline.bindPopup(desc);
            polylines.push(polyline);
            contents.push(desc + "<br>");
            for (var m = 0; m < markers.length; m++) {
                var mk = markers[m];
                if (mk._latlng.lat == endpoint[0] && mk._latlng.lng == endpoint[1]) {
                    var r = parseInt(weight) / 1000;
                    if (r < 3) {
                        r = 3
                    }
                    mk.setRadius(parseInt(r));
                    break;
                }
            }
        }
        contents.sort(function (a, b) {
            return parseInt(a.split("-")[2]) < parseInt(b.split("-")[2]) ? 1 : -1
        });
        $("#line_info").html(contents);
        layerGroup = L.layerGroup(polylines).addTo(map);
    }

    function group(num) {
        return num < 1000 ? 1 : num < 5000 ? 2 : num < 10000 ? 3 : num < 50000 ? 4 : 5;
    }
     processData(results);
});
