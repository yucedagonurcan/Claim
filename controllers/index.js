module.exports = function(app) {

    var fs = require('fs');
    var path = require("path");
    var pool = require('./connect_db');
    var bodyParser = require('body-parser');
    var data;

    
    var num_of_movies;
    var user_rate_array = [];

    var jsonEncodedBody = bodyParser.json({ extended: false });
    var urlEncodedBody = bodyParser.urlencoded({extended: true});


    // GET /index
    app.get("/index", function (req, res) {

        var query_whole_db = 'SELECT * FROM Movies ';
        var query_string = query_whole_db + 'LIMIT 20';

        // Whole movie dataset.
        pool.query(query_whole_db, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            num_of_movies = result.length;

        });

        pool.query(query_string, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('index',{movies_data: result});
        });

    });
    // POST /index/ => :movieName
    app.post("/search", urlEncodedBody,  function (req, res) {

        var query_string = "SELECT * FROM Movies WHERE Title LIKE '%" + req.body.text + "%'";
        pool.query(query_string, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('index',{movies_data: result});
            
        });

    });

    // POST /index
    app.post("/index", jsonEncodedBody, function(req, res, err){
        
        user_rate_array.push(req.body);
        console.log(req.body);
        res.send(`Data pushed to the user_rate_matrix ${req.body.itemid}`);

    });

    // GET /index/recommend
    app.get("/index/recommend", function(req, res){

        var user_item_matrix = CreateItemRatingMatrix(user_rate_array);
        res.send(user_rate_array);
        
    });

    function CreateItemRatingMatrix(ratingsJson){
        
        console.log(num_of_movies);
        var matrix = Array.from(Array(num_of_movies), () => 0);
        var movies =[];
        var ratings =[];
        for(var i=0; i<ratingsJson.length; i++){
            movies.push(parseInt(ratingsJson[i].itemid));
            ratings.push(parseInt(ratingsJson[i].rating));
        }
        for(var j=0; j<movies.length; j++){

            matrix[movies[j]] = ratings[j];

        }
        return matrix;
    }
}
