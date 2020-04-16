
console.log('App init.')

App = {

}

/* -------------------------------------------------------------------------- */

App.getIp = (connection) => {
    var ip = connection.connection.httpHeaders['x-forwarded-for'].split(',')
    var ip = ip[0]
    return ip
}

/* -------------------------------------------------------------------------- */

App.getUserAgent = (connection)=>{

}
/* -------------------------------------------------------------------------- */

App.ipGeo = (ip) => {
    // https://geojs.io
    var x = HTTP.get('https://get.geojs.io/v1/ip/geo/' + ip + '.json');
    if (x && x.data) {
        return x.data;
    }
}
/* -------------------------------------------------------------------------- */


App.getUserMeta = (connection) => {
    var meta = {
        connection: connection.id,
        ip: connection.clientAddress,
        ip2: connection.connection.httpHeaders['x-forwarded-for'].split(','),
        browser: connection.httpHeaders["user-agent"]
    }
    return meta;
}



module.exports = App


