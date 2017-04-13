var csv = require('fast-csv');
var fs = require('fs');
var ag = {}
csv
  .fromPath("station_data.csv", { headers: true })
  .on("data", function(data) {
    console.log(data.time);
  })
  .on("end", function(data) {
    console.log("done");
  })
