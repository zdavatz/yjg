import {
  Meteor
} from 'meteor/meteor';
const fs = require('fs')
const path = require('path');
import _ from 'lodash'
import Papa from 'papaparse';
/* -------------------------------------------------------------------------- */
import assesLib from './_assets.js'
import App from './ip_agent.js'
import '../lib/col.js';
/* -------------------------------------------------------------------------- */
console.log('Loading configuration')
require('dotenv').config();
/* -------------------------------------------------------------------------- */

let currentFile;
meteorPath = process.env['METEOR_SHELL_DIR'] + '/../../../'
publicPath = process.env['METEOR_SHELL_DIR'] + '/../../../public/';

/* -------------------------------------------------------------------------- */

Meteor.startup(() => {
  setZipCode()
});


/* -------------------------------------------------------------------------- */
Meteor.methods({
  getStats(){
    console.log('Getting Stats:')
    var r =  {
      checkedAt : new Date(),
      items: Items.find().count() 
    }
    console.log(r)
    return r;
  },
  setBrowserId(){
    var browserId = setBrowserId()
    console.log('Setting Browser Id')
    return browserId
  },
  setLocation(coordinates) {
    if (!coordinates) {
      throw new Meteor.Error('setLocation-err', "Coordinates is missing")
    }
    var data;
    //
    var url = "http://geodesy.geo.admin.ch/reframe/wgs84tolv03?easting=" + coordinates.lng + "&northing=" + coordinates.lat + "&altitude=550.0%20&format=json"
    var x = HTTP.get(url);
    if (x && (x.statusCode == 200)) {
      console.log('Success: geodesyGEO API:')
      console.log('http://geodesy.geo.admin.ch/reframe/wgs84tolv95?easting', x.data)
      data = x.data;
      data.api = "geodesy-LV03"
    } else {
      throw new Meteor.Error('apt-connection-error', url)
    }
    // SETTING THE VALUE
    data.long = coordinates.lng;
    data.lat = coordinates.lat;
    // NOT USED
    var geoMAPCoordsAPI = 'http://geodesy.geo.admin.ch/reframe/wgs84tolv95?easting=' + coordinates.lng + '&northing=' + coordinates.lat + "&format=json";
    var geoMapCoords = HTTP.get(geoMAPCoordsAPI);
    if (geoMapCoords && (geoMapCoords.statusCode == 200)) {
      console.log("Success: geoMAPCoordsAPI", {
        url: geoMapCoords,
        geoMapData: geoMapCoords.data
      })
    } else {
      throw new Meteor.Error('apt-connection-error', url)
    }
    // ZipCode "ZLP"
    var zipAPI = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry=" + data.easting + "," + data.northing + "&imageDisplay=0,0,0&mapExtent=0,0,0,0&tolerance=0&layers=all:ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill,ch.swisstopo-vd.ortschaftenverzeichnis_plz&returnGeometry=false"
    console.log("GETTING ZLP DATA: ", zipAPI)
    var zipRequest = HTTP.get(zipAPI)
    if (zipRequest) {
      console.log('Success: ZLP')
      console.log('ZLP: ', {
        data: zipRequest.data
      })
      data.zlp = zipRequest.data
    } else {
      throw new Meteor.Error('apt-connection-error', zipAPI)
    }
    console.log("URLS:", {
      NECoordsAPI: url,
      geoMapCoords: geoMAPCoordsAPI,
      zipAPI,
      zipAPI
    })
    console.log({
      location: coordinates,
      results: data
    })
    if (data.altitude) {
      delete data.altitude
    }
    var dataReady = coordinates;
    data.conenctionId = this.connection.id
    dataReady.ip = App.getIp(this)
    dataReady.createdAt = new Date();
    var dataReady = _.assign(dataReady, data)
    console.log("++++ INSERTING IN DATABSE +++++")
    console.log({
      dataReady
    })
    Items.insert(dataReady)
    console.log("SUCCESS: DB Recoding Complete")
    return data
  }
})
/* ------------------------------------File Export---------------------------------- */

Meteor.startup(function () {
  saveFile()
})


SyncedCron.start();


SyncedCron.add({
  name: 'Crunch some important numbers for the marketing department',
  schedule: function (parser) {
    // parser is a later.parse object
    // return parser.text('every 40 seconds')
    return parser.text('at 7:00am every day');
  },
  job: function () {
    saveFile()
  }
});


/* -------------------------------------------------------------------------- */
//covgeo_export_dd.mm.yy_hh.mm.ss.csv

function saveFile() {

  var dir = 'public'
  console.log('Checking  '+dir+ " exists!")
  if (!fs.existsSync(meteorPath + dir)) {
    fs.mkdirSync(meteorPath + dir);
  }

  console.log('Directory: '+dir+ " is Ready!")

  console.log("Deleting the old file")
  var filesToDelete = getFilesFromPath(publicPath, "csv")
  console.log(filesToDelete)
  _.each(filesToDelete, (file) => {
    fs.unlinkSync(publicPath + file)
  })
  console.log("Deleting the old file: SUCCESS")
  var date = formatDate(new Date())
  console.log("Setting File Date: ", date)
  var file = 'covgeo_export_' + date + ".csv"
  var file = "covgeo_export_daily_7am.csv"
  console.log("Setting File name", file)
  console.log("Reading the data.......")
  var items = Items.find().fetch()
  var items = _.map(items,(item)=>{
    var item = item;
    item.PLZ = JSON.stringify(item.zlp)
    delete item.zlp;
    return item
  })
  var csv = Papa.unparse(items)
  console.log("Writing Data: Items", items.length)
  fs.writeFileSync(publicPath + file, csv, (err) => {
    if (err) log('error', err);
    log('progress', "File updated" + file);
  });
}

function getFilesFromPath(path, extension) {
  let dir = fs.readdirSync(path);
  return dir.filter(elm => elm.match(new RegExp(`.*\.(${extension})`, 'ig')));
}

// covgeo_export_dd.mm.yy_hh.mm.ss.csv


function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    h = d.getHours(),
    m = d.getMinutes(),
    s = d.getSeconds();
  var output = day + "." + month + "." + year + "_" + h + "." + m + "." + s
  console.log(output)
  return output;
}

formatDate(new Date())

/* --------------------------------------ZipCode------------------------------------ */


function setZipCode() {
  if (Zips.find().count() == 0) {
    var dataset = assesLib.readAssets('CH.txt', 'text')
    var head = ['country', 'zip', 'place', 'adminName1', 'adminCode1', 'adminName2', 'adminCode2', 'adminName3', 'adminCode3', 'latitude', 'longitude', 'accuracy']
    console.log('Sample Code', dataset[0].split('\t'))
    _.each(dataset, (row) => {
      var col = createRow(head, row.split('\t'))
      col.loc = {
        "type": "Point",
        "coordinates": [
          parseFloat(col.longitude),
          parseFloat(col.latitude)
        ]
      }
      console.log(col)
      Zips.insert(col)
    })
    console.log("ZipCode Database: Inserted and ready")
  }
  console.log('ZipCode Database is ready')
}
/** Convert rows into obj Collection */
function createRow(head, row) {
  var o = {}
  _.map(head, (i, k) => {
    o[i] = row[k]
  })
  // console.log(o)
  return o
}
/* -------------------------------------------------------------------------- */
/** SSL */

Meteor.startup(function () {
  console.log('SSL Setting', Meteor.settings.isSSL || 0)
  if (Meteor.settings.isSSL) {
    const isProduction = process.env.NODE_ENV !== 'development';
    if (!isProduction) {
      const httpProxy = require('http-proxy');
      const SSL = function (key, cert, port) {
        const [, , host, targetPort] = Meteor.absoluteUrl().match(/([a-zA-Z]+):\/\/([\-\w\.]+)(?:\:(\d{0,5}))?/);
        const proxy = httpProxy
          .createServer({
            target: {
              host,
              port: targetPort,
            },
            ssl: {
              key,
              cert,
            },
            ws: true,
            xfwd: true,
          })
          .listen(port);
        proxy.on('error', err => {
          console.log(`HTTP-PROXY NPM MODULE ERROR: ${err}`);
        });
        console.log('PROXY RUNNING ON', port, proxy);
      };
      //
      SSL(Assets.getText('key.pem'), Assets.getText('cert.pem'), 3100);
    }
  }
});
/* -------------------------------------------------------------------------- */
/** SetBrowserId */

function setBrowserId() {
  var browserId = Random.id()
  var isExists = Items.findOne({
    browserId: browserId
  })
  if (isExists) {
    setBrowserId()
  } else {
    return browserId
  }
}