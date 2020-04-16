# yjg
ywesee javascript geolocation

1. Show button in HTML page.
2. Show Option for user to enter Username.
3. Click the button and grab long/lat with [this library](https://github.com/trekhleb/use-position).
4. Ask for permission to access GPS data on the mobile phone.
5. User clicks the button to share location and his username (optional)
6. Geolocation and Browser-ID is saved in the database.
7. If the Geolocation changes more then 100 meters, the user can save his location again.


## Configure

Get the map token from https://locationiq.com
- copy settings.example.json to settings.json
- add the token
  
settings.json 
```
{
    "locationiqComId": "",
    "isSSL": false
}

```

## Run 
 ```
 $ meteor npm i

 $ meteor --settings settings.json

// with SSL support
 $ meteor --settings settings.json --port 3300

 ```

 
8. Translate GPS coordinates into PLZ and Streetname.
