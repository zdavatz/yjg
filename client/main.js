
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
const geo = navigator.geolocation;
/* -------------------------------------------------------------------------- */



Tracker.autorun(() => {
  AllGeo.getLocationByNavigator(function(location){
    console.log('my device location', location);
    App.setSetting({msg: JSON.stringify(location)})
    App.setSetting({position: location})
  });

});



Template.app.events({
  'click .setLocation': (e)=>{
    e.preventDefault()
    if(App.getSetting('position')){
      Meteor.call('setLocation',App.getSetting('position'),(err,data)=>{
        console.log(err,data)
        App.setSetting({ipData: JSON.stringify(data)})
        App.setSetting({easting:data.easting, northing: data.northing})
      })
    }

  }
})