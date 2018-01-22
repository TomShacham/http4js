## Http4js


### A port of http4k

Coming soon ... :P

Manual post request in node repl for testing

```
var pr = http.request(opts, function(res) {
     res.setEncoding('utf8');
     res.on('data', function (chunk) {
           console.log('Response: ' + chunk);
       });
 });
pr.write("blah");
pr.end();
```
