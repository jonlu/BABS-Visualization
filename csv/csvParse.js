var csv = require('fast-csv');
var fs = require('fs');

csv
  .fromPath("station_data.csv", { headers: true })
  .transform(function(d) {
    if (d.landmark != "San Francisco") {
      return;
    }

    return {
      "station_id": d.station_id,
      "name": d.name,
      "lat": d.lat,
      "long" : d.long,
      "dockcount": d.dockcount,
      "landmark": d.landmark,
      "installation": d.installation
    }

  })
  .pipe(csv.createWriteStream({ headers: true }))
  .pipe(fs.createWriteStream("geo.csv", { encoding: "utf8" }));
