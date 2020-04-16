import {
    Meteor
} from 'meteor/meteor';
import _ from 'lodash';

assets = {}
/* -------------------------------------------------------------------------- */
/*                                 readAssets                                 */
/* -------------------------------------------------------------------------- */

assets.readAssets = (file, type) => {
    try {
        console.log('Reading '+type+' file',file)
        var data = Assets.getText(file)
        switch (type) {
            case "text":
                var lines = _.compact(data.split('\n'))
                console.log('Lines:', lines)
                return lines;
                // break;
            case "json":
                var json = JSON.parse(data)
                console.log('JSON:', json)
                return json
                break;
            default:
                console.log('Assets Reading Warning, set Type: ', file);
        }
    } catch (err) {
        throw new Meteor.Error('app-readAssetsErr', err)
    }
}
/* -------------------------------------------------------------------------- */

assets.getLastItemNo = function(){
    var lastNumberedItem = Items.find({no:{$exists:true}},{sort:{no:-1},limit : 1}).fetch()
    if(lastNumberedItem.length){
      var lastNo = parseInt(lastNumberedItem[0].no) + 1
      return lastNo
    }else{
      return 1
    }
  }


module.exports = assets;