# yjg - ywesee javascript geolocation
1. Show button in HTML page.
2. Show Option for user to enter Username.
3. Click the button and grab long/lat with [this library](https://github.com/trekhleb/use-position).
4. Ask for permission to access GPS data on the mobile phone.
5. User clicks the button to share location and his username (optional)
6. Geolocation and Browser-ID is saved in the database.
7. If the Geolocation changes more then 100 meters, the user can save his location again.
8. Translate GPS coordinates into PLZ and Streetname.

## optional: configure locationiq.com
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
 $ meteor --settings settings.json --port 3100

 ```
## Digital Ocean Deployment
### Apache Setup
```
~$ cat /etc/apache2/sites-enabled/yjg.conf
<VirtualHost *:80>
  ServerName covgeo.ch
  Redirect permanent / https://covgeo.ch
</VirtualHost>

<VirtualHost 165.22.16.219:443>
  ServerName covgeo.ch
  ProxyPreserveHost On
  ProxyPass  /excluded !
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
  SSLEngine on
  SSLCertificateFile /etc/letsencrypt/live/covgeo.ch/cert.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/covgeo.ch/privkey.pem
  SSLCertificateChainFile /etc/letsencrypt/live/covgeo.ch/chain.pem
</VirtualHost>
```
### Letsencrypt Setup
```
./certbot-auto certonly --server https://acme-v02.api.letsencrypt.org/directory --manual --preferred-challenges dns -d '*.covgeo.ch'  -d covgeo.ch
````

### acme TXT Record setup
1. [Set acme Domain TXT records](https://user-images.githubusercontent.com/4953/79723589-51854980-82e6-11ea-8dfc-4f0efe4b6d3c.png)
2. Test acme Setup `dig -t TXT _acme-challenge.covgeo.ch`
