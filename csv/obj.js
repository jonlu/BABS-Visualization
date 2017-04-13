var csv = require('fast-csv');
var fs = require('fs');
var dict = {};

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}
csv
  .fromPath("geo.csv", { headers: true })
  .on("data", function(data) {

    dict[data.name] = data.station_id;

  })
  .on("end", function(data) {
    console.log(dict);

  })
