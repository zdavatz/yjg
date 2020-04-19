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
/* -------------------------------------------------------------------------- */
Template.app.events({
  'click .setLocation': (e)=>{
    // e.preventDefault()
    var status = $(e.currentTarget).attr('status')
    console.log("status", status)
    var data = App.getSetting('position')
    if(data){
      data.status = status;
      if(status == 'positiv'){
        data.positiv = true
      }
      console.log("Data", data)
      Meteor.call('setLocation',data,(err,data)=>{
        console.log(err,data)
        if(err){
          alert('Error:Server connection Error')
          return
        }
        App.setSetting({ipData: JSON.stringify(data, undefined, 2)})
        App.setSetting({easting:data.easting, northing: data.northing})
      })
    }else{
      alert('Location is not set, Please make sure the GPS is on.')
    }
  }
})
/* -------------------------------------------------------------------------- */
