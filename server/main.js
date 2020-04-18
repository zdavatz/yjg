import {
  Meteor
} from 'meteor/meteor';

import assesLib from './_assets.js'
import App from './ip_agent.js'
import _ from 'lodash'


import '../lib/col.js';

require('dotenv').config();



// if (!Meteor.settings.locationiqComId) {
//   console.log("ERROR: locationiq_Com_Id token is not set, please add the token from https://locationiq.com  to your settings.json file")
//   throw new Meteor.Error('key-missing', "ERROR: locationiq_Com_Id key is not set, please add the token from https://locationiq.com  to your settings.json file")
//   return
// }else{
//   console.log("Key: ", Meteor.settings.locationiqComId)
//   var locationiqComId = Meteor.settings.locationiqComId
// }

// country code      : iso country code, 2 characters
// postal code       : varchar(20)
// place name        : varchar(180)
// admin name1       : 1. order subdivision (state) varchar(100)
// admin code1       : 1. order subdivision (state) varchar(20)
// admin name2       : 2. order subdivision (county/province) varchar(100)
// admin code2       : 2. order subdivision (county/province) varchar(20)
// admin name3       : 3. order subdivision (community) varchar(100)
// admin code3       : 3. order subdivision (community) varchar(20)
// latitude          : estimated latitude (wgs84)
// longitude         : estimated longitude (wgs84)
// accuracy          : accuracy of lat/lng from 1=estimated, 4=geonameid, 6=centroid of addresses or shape


// Zips._dropIndex('loc.coordinates');
Zips._ensureIndex({'loc':'2dsphere'}); 





Meteor.methods({
  setLocation(coordinates) {
    console.log('coordinates', coordinates)
    var data;
    // var ip = App.getIp(this)
    // console.log(ip)
    // var data = App.ipGeo(ip)
    // console.log(data)

    // var s = HTTP.get('https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry='+ coordinates.lng +","+ coordinates.lat +'&imageDisplay=0,0,0&mapExtent=0,0,0,0&tolerance=0&layers=all:ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill,ch.swisstopo-vd.ortschaftenverzeichnis_plz&returnGeometry=false')
    // var old = 'https://eu1.locationiq.com/v1/reverse.php?key='+locationiqComId+'&lat='+coordinates.lat+'&lon='+coordinates.lng+'&format=json'
    // console.log(s)


    var url =  'http://geodesy.geo.admin.ch/reframe/wgs84tolv95?easting='+coordinates.lng+'&northing='+ coordinates.lat+"&format=json";
   
   
    var x = HTTP.get(url);
    if (x && (x.statusCode == 200)) {
        console.log('Success:')
        console.log('http://geodesy.geo.admin.ch/reframe/wgs84tolv95?easting',x.data)
         data = x.data;
    }else{
        throw new Meteor.Error('apt-connection-error',url)
    }

    

    console.log('Coords API Updates', data)

    var zipAPI = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry="+data.northing+","+data.easting+"&imageDisplay=0,0,0&mapExtent=0,0,0,0&tolerance=0&layers=all:ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill,ch.swisstopo-vd.ortschaftenverzeichnis_plz&returnGeometry=false"
    var zipRequest = HTTP.get(zipAPI)

    if (zipRequest) {
      console.log('Success: ZLP')
      console.log('ZLP: ',{data: zipRequest.data})
        // return zipRequest.data;
        data.zlp = zipRequest.data
  }else{
      throw new Meteor.Error('apt-connection-error',zipAPI)
  }



  return data

    // I20200415-15:41:38.080(3)?   loc: { type: 'Point', coordinates: [ 8.5307, 47.3828 ] }

    // var s = Zips.find({
    //   loc: {
    //     $near: {
    //         $geometry:
    //             { type: "Point", coordinates: [8.5307, 47.3828] }, 
    //             // { type: "Point", coordinates: [coordinates.lng, coordinates.lat] }, 
    //             $minDistance: 10
    //     }
    // }
    // }).fetch();

    // console.log(s.length, s[0])
    // return s
  }
})



// var s = Zips.find({
//   loc: {
//     $near: {
//         $geometry:
//             { type: "Point", coordinates: [2825350.91586853,  1166527.3365577655] }, 
//             // { type: "Point", coordinates: [coordinates.lng, coordinates.lat] }, 
//     }
// }
// }).fetch();

// console.log(s.length, s[0])


//

// Zips.remove({})
Meteor.startup(() => {
  if (Zips.find().count() == 0) {
    var dataset = assesLib.readAssets('CH.txt', 'text')
    var head = ['country', 'zip', 'place', 'adminName1', 'adminCode1', 'adminName2', 'adminCode2', 'adminName3', 'adminCode3', 'latitude', 'longitude', 'accuracy']
    console.log('Sample Code',dataset[0].split('\t'))
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

});
/** Convert rows into obj Collection */
function createRow(head, row) {
  var o = {}
  _.map(head, (i, k) => {

    o[i] = row[k]

  })

  // console.log(o)
  return o
}
/** */

// function getCorrData(){ 
//   var x = HTTP.get('https://eu1.locationiq.com/v1/reverse.php?key=YOUR_PRIVATE_TOKEN&lat=LATITUDE&lon=LONGITUDE&format=json' + ip + '.json');
//   if (x && x.data) {
//       return x.data;
//   }
// }

/**
 * SSL
 */
console.log('SSL Setting',Meteor.settings.isSSL)
Meteor.startup(function () {
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
