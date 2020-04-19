import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';
const geo = navigator.geolocation;
/* -------------------------------------------------------------------------- */
Meteor.startup(function(){

  var browserId = LocalStore.get('browserId');
  if(!browserId){
    Meteor.call('setBrowserId',null,(err,data)=>{
      console.log(err,data)
      if(err){
        alert('Setting Browser ID error')
      }
      if(!err && data){
        console.log("Setting Browser ID", browserId)
        console.log("BrowserId: ", data)
        App.setSetting({browserId: data})
        console.log("SUCCESS Setting browser ID")
        LocalStore.set('browserId', data);
      }
    })
  }else{
    console.log("BrowserID Found", browserId)
  }

})
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
      data.browserId = LocalStore.get('browserId');
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
