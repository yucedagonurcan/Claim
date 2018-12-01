var express = require('express');
var app = express();
var port = 81;
var index = require('./controllers/index');
 

// set the view engine to ejs
app.set('view engine', 'ejs');

index(app);

app.use(express.static(__dirname + '/assets'));

app.listen(port, function () {
    console.log(`Listening on port: ${port}`);
});
