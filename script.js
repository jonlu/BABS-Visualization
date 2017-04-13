var stations = [41, 42, 45, 46, 47, 48, 49, 50, 51, 39, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 82, 90, 91];
var stationDict = {
  'Clay at Battery': '41',
  'Davis at Jackson': '42',
  'Commercial at Montgomery': '45',
  'Washington at Kearney': '46',
  'Post at Kearney': '47',
  'Embarcadero at Vallejo': '48',
  'Spear at Folsom': '49',
  'Harry Bridges Plaza (Ferry Building)': '50',
  'Embarcadero at Folsom': '51',
  'Powell Street BART': '39',
  'Embarcadero at Bryant': '54',
  'Temporary Transbay Terminal': '55',
  'Beale at Market': '56',
  '5th at Howard': '57',
  'San Francisco City Hall': '58',
  'Golden Gate at Polk': '59',
  'Embarcadero at Sansome': '60',
  '2nd at Townsend': '61',
  '2nd at Folsom': '62',
  'Howard at 2nd': '63',
  '2nd at South Park': '64',
  'Townsend at 7th': '65',
  'South Van Ness at Market': '66',
  'Market at 10th': '67',
  'Yerba Buena Center of the Arts (3rd @ Howard)': '68',
  'San Francisco Caltrain 2 (330 Townsend)': '69',
  'San Francisco Caltrain (Townsend at 4th)': '70',
  'Powell at Post (Union Square)': '71',
  'Civic Center BART (7th at Market)': '72',
  'Grant Avenue at Columbus Avenue': '73',
  'Steuart at Market': '74',
  'Mechanics Plaza (Market at Battery)': '75',
  'Market at 4th': '76',
  'Market at Sansome': '77',
  'Broadway St at Battery St': '82',
  '5th St at Folsom St': '90',
  'Cyril Magnin St at Ellis St': '91'
}

document.addEventListener('DOMContentLoaded', function(event) {
  console.log("DOM fully loaded and parsed");
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9ubHUiLCJhIjoiY2l5bWdmYjlxMDAwZjQ0czdtYmNwYXQwNyJ9.PXRqPMmzNofQx4FYKMmJ_A';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.404, 37.7849],
    minZoom: 8.5,
    maxZoom: 16,
    zoom: 12.3,
    attributionControl: false
  });
  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-left');
  map.addControl(new mapboxgl.AttributionControl({
    compact: true
  }));
  var canvas = map.getCanvasContainer();
  var markersList = [];
  d3.json("csv/stations.geojson", function(data) {
    data.features.forEach(function(marker) {
      // console.log(marker);
      var el = document.createElement('div');
      el.className = 'marker';
      el.id = marker.properties.station_id;
      el.style.width = map.getZoom() * 2 + 'px';
      el.style.height = map.getZoom() * 2 + 'px';
      // el.style.width = '48px';
      // el.style.height = '48px';
      el.style.backgroundImage = 'url(imgs/bikeblue.png)';
      el.style.backgroundSize = "contain";
      // el.style.backgroundColor = "red";
      el.addEventListener('click', function(e) {
        if (!e.metaKey && !e.shiftKey && !e.ctrlKey) {
          markersList = [];
          clearHighlights();
          markersList.push(marker.properties.station_id);
          var mark = document.getElementById(marker.properties.station_id);
          mark.classList.add("highlighted");
          updateLineData(markersList);
          updateBarData(markersList);

        } else {
          if (markersList.includes(marker.properties.station_id)) {
            var index = markersList.indexOf(marker.properties.station_id);
            index.classList.remove("highlighted");
            markersList.splice(index, 1);
          } else {
            markersList.push(marker.properties.station_id);
          }
          selectMarkers();
          // console.log(markersList);
        }

      });
      var popup = new mapboxgl.Popup({ offset: 15 })
        .setLngLat(marker.geometry.coordinates)
        .setHTML('<h4>' + marker.properties.name + '</h4>')
      popup.on('close', function(e) {
        var popUps = document.getElementsByClassName('mapboxgl-popup');
        // Check if there is already a popup on the map
        if (!popUps[0] && map.loaded()) {
          if (markersList.length == 1 || markersList.length == 0 || !e.metaKey && !e.shiftKey && !e.ctrlKey) {
            clearHighlights();
          }
          initializeLine();
          initializeBar();
        }



      });
      new mapboxgl.Marker(el, { offset: [-15, -15] })
        .setLngLat(marker.geometry.coordinates)
        .setPopup(popup)
        .addTo(map);
    })
  });

  function clearHighlights() {
    var marks = document.getElementsByClassName('highlighted');
    for (var i = marks.length - 1; i >= 0; i--) {
      // s(marks[i]);
      marks[i].classList.remove("highlighted");
    }
  }

  function selectMarkers() {

    markersList.forEach(function(marker) {
      var m = document.getElementById(marker);
      m.classList.add("highlighted");
    });
    updateLineData(markersList);
    updateBarData(markersList);


  }
  // map.on('click', function() {
  //     var popUps = document.getElementsByClassName("mapboxgl-popup");
  //     if (!popUps[0]) {
  //       initializeLine();
  //       initializeBar();
  //       clearHighlights();
  //     }
  // })
  // Change size of the markers after zooming. Glitchy, but it is what it is.
  map.on('zoomend', function() {
    var currentZoom = map.getZoom();
    var markers = document.getElementsByClassName("mapboxgl-marker");
    // console.log(markers);
    [].forEach.call(markers, function(marker) {
      marker.style.width = currentZoom * 2 + "px";
      marker.style.height = currentZoom * 2 + "px";
    });
  });

  /************ LINE CHART **********/
  var svgLine = d3.select("#svgLine"),
    margin = { top: 20, right: 20, bottom: 110, left: 80 },
    margin2 = { top: 430, right: 20, bottom: 30, left: 80 },
    width = +svgLine.attr("width") - margin.left - margin.right,
    height = +svgLine.attr("height") - margin.top - margin.bottom,
    height2 = +svgLine.attr("height") - margin2.top - margin2.bottom
  var parseTime = d3.timeFormat("%H:%M")

  var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

  var xAxis = d3.axisBottom(x).tickFormat(parseTime),
    xAxis2 = d3.axisBottom(x2).tickFormat(parseTime),
    yAxis = d3.axisLeft(y);

  var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

  var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  svgLine.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var focus = svgLine.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    focus.append("text")
    .attr("y", height)
    .attr("x", width - 40)
    .style("font-size", "14px")
    .attr("dy", "16px")
    // .attr("text-anchor", "end")
    .text("Time");
  focus.append("g")
    .attr("class", "axis axis--y")
  var context = svgLine.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
  // x.domain([new Date((d3.extent(data, function(d) { return d.key; })[0])), new Date((d3.extent(data, function(d) { return d.key; })[1]))]);
  context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height2 + ")")


  context.append("g")
    .attr("class", "brush")

  var line = d3.line()
    .x(function(d) { return x(new Date(d.key)); })
    .y(function(d) { return y(d.value); });
  var line2 = d3.line()
    .x(function(d) { return x2(new Date(d.key)); })
    .y(function(d) { return y2(d.value); });

  function initializeLine() {
    d3.csv("csv/minutelymilli.csv", function(error, csv_data) {
      var data = d3.nest()
        // .key(function(d) { return new Date(parseInt(d.time, 10)) })
        .key(function(d) {
          return new Date(parseInt(d.time, 10));
        })
        .rollup(function(d) {
          return d3.mean(d, function(g) { return g.bikes_available; });
        }).entries(csv_data);
      updateLine(data);
    });
  }
  initializeLine();

  function updateLine(data) {
    // var t = d3.transition()
    //   .ease("linear")
    //   .duration(750);
    if (data[data.length - 1].key === "undefined") {
      data.pop();
    }
    if (data[0].key === "undefined") {
      data.splice(0, 1);
    }

    data.sort(function(a, b) {
      var ayy = new Date(a.key).getTime();
      var bee = new Date(b.key).getTime();
      return ayy - bee;
    })
    x.domain(d3.extent(data, function(d) { return new Date(d.key); }));
    y.domain(d3.extent(data, function(d) { return d.value; }));
    x2.domain(x.domain());
    y2.domain(y.domain());





    var contextPath = context.selectAll(".line")
      .data([data]);

    contextPath.enter().append("path")
      .attr("class", "line")
      .attr('d', line2)
    contextPath.transition().attr('d', line2)

    context.selectAll(".axis--x").call(xAxis2);
    context.selectAll(".brush").call(brush)
      .call(brush.move, x.range());
    svgLine.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    var path = focus.selectAll(".line")
      .data([data]);

    path.enter().append("path")
      .attr("class", "line")
      .transition()
      .attr('d', line);
    path.transition().duration(900).attr('d', line);
    focus.selectAll(".axis--x").transition().call(xAxis);
    focus.selectAll(".axis--y").transition().call(yAxis);


  }

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".line").attr("d", line);
    focus.select(".axis--x").call(xAxis);
    svgLine.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
    // console.log(s.map(x2.invert, x2));
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".line").attr("d", line);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    // console.log(t.rescaleX(x2).domain());
  }

  function updateLineData(markersList) {
    d3.csv("csv/minutelymilli.csv", function(error, csv_data) {
      var data = d3.nest()
        .key(function(d) {
          if (markersList.includes(d.station_id)) {
            return new Date(parseInt(d.time, 10));
          }
        })
        .rollup(function(d) {
          return d3.mean(d, function(g) { return g.bikes_available; });
        }).entries(csv_data);
      updateLine(data);
    });
  }




  /***************** BAR CHART *****************/

  var xBar = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    yBar = d3.scaleLinear().range([height, 0]),
    bargin = { top: 20, right: 20, bottom: 150, left: 80 };
  var xAxisBar = d3.axisBottom(xBar);
  var yAxisBar = d3.axisLeft(yBar);
  var barTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return d.key + ":" + Math.round(d.value); });
  var svgBar = d3.select("#barChart").append("svg")
    .attr("width", width + bargin.left + bargin.right)
    .attr("height", height + bargin.top + bargin.bottom)
    .append("g")
    .attr("transform", "translate(" + bargin.left + "," + bargin.top + ")");
  svgBar.append("g")
    .attr("class", "x--axis")
    .attr("transform", "translate(0," + height + ")")
  svgBar.append("g")
    .attr("class", "y--axis")

    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Trips");
  svgBar.call(barTip);

  function initializeBar() {
    d3.csv("csv/avgTripsMin.csv", function(error, csv_data) {
      var data = d3.nest()
        // .key(function(d) { return new Date(parseInt(d.time, 10)) })
        .key(function(d) {
          if (stations.includes(+d["End Terminal"])) {
            return d["End Station"];
          }
        })
        .rollup(function(d) {
          return d3.mean(d, function(g) { return g.Trips; });
        }).entries(csv_data);
      updateBar(data);
    });
  }
  initializeBar();
  initializeBar();

  function updateBar(data) {
    console.log(data);
    if (data[data.length - 1].key === "undefined") {
      data.pop();
    }
    if (data[0].key === "undefined") {
      data.splice(0, 1);
    }

    xBar.domain(data.map(function(d) { return d.key }));
    yBar.domain([0, d3.max(data, function(d) { return d.value; })]);
    svgBar.selectAll(".x--axis")
      .transition()
      .call(xAxisBar)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-50)");
    svgBar.selectAll(".y--axis")
      .transition()
      .call(yAxisBar);

    var bars = svgBar.selectAll(".bar")
      .data(data);
    bars.enter().append("rect")
      // .merge(bars)
      .attr("class", "bar")
      .attr("y", yBar(0))
      .attr("height", height - yBar(0))
      .attr("fill", "#1998F7")
      .on('mouseover', function(d) {
        barTip.show(d);
        d3.select(this)
          .attr('fill', 'orange');
      })

      .on('mouseout', function(d) {
        barTip.hide(d);
        d3.select(this)
          .transition()
          .duration(250)
          .attr('fill', "#1998F7")
      })
      .on('click', function(d) {
        // buggy popoups with mapbox

        // markersList = [];
        // clearHighlights();
        // markersList.push(stationDict[d.key]);
        var mark = document.getElementById(stationDict[d.key]);
        // addPopUp(d.key);
        // mark.classList.add("highlighted");
        // updateLineData(markersList);
        // updateBarData(markersList);
        triggerEvent( mark, 'click' );

      });
    bars.exit()
      .transition()
      .duration(300)
      .attr("y", yBar(0))
      .attr("height", 0)
      .style('fill-opacity', 1e-6)
      .remove();






    bars.transition().duration(300)
      .attr("x", function(d) { return xBar(d.key); }) // (d) is one item from the data array, x is the scale object from above
      .attr("width", xBar.bandwidth()) // constant, so no callback function(d) here
      .attr("y", function(d) { return yBar(d.value); })
      .attr("height", function(d) { return height - yBar(d.value); })


  }

  function updateBarData(markersList) {
    d3.csv("csv/avgTripsMin.csv", function(error, csv_data) {
      // console.log(markersList);

      var data = d3.nest()
        .key(function(d) {
          if (markersList.includes(d["Start Terminal"]) && stations.includes(+d["End Terminal"])) {
            return d["End Station"];
          }
        })
        .rollup(function(d) {
          return d3.mean(d, function(g) { return g.Trips; });
        }).entries(csv_data);
      updateBar(data);
    });
  }
  // REALLY BUGGY FOR NO REASON FUCKIN MAPBOX. SMH.
  function addPopUp(html) {

    d3.json("csv/stations.geojson", function(data) {
      data.features.forEach(function(marker) {
        if (marker.properties.name == html) {
          var popup = new mapboxgl.Popup({ offset: 15 })
            .setLngLat(marker.geometry.coordinates)
            .setHTML('<h4>' + marker.properties.name + '</h4>')
          popup.on('close', function() {
            var popUps = document.getElementsByClassName('mapboxgl-popup');
            // Check if there is already a popup on the map
            if (!popUps[0] && map.loaded()) {
              if (markersList.length == 1 || markersList.length == 0 || !e.metaKey && !e.shiftKey && !e.ctrlKey) {
                clearHighlights();
              }
              initializeLine();
              initializeBar();
            }

          });
          popup.addTo(map);
          return false;
        }
      });
    });
  }
});

function triggerEvent( elem, event ) {
  var clickEvent = new Event( event ); // Create the event.
  elem.dispatchEvent( clickEvent );    // Dispatch the event.
}
