module.exports = function(app) {

    var fs = require('fs');
    var path = require("path");
    var pool = require('./connect_db');
    var bodyParser = require('body-parser');
    var recommender = require('recommender');
    const util = require('util');

    var ratings_data;
    var dataset_item_rating_matrix;
    
    var num_of_movies;
    var num_of_users;
    var user_rate_array = [];

    var movies_dataset;

    var jsonEncodedBody = bodyParser.json({ extended: false });
    var urlEncodedBody = bodyParser.urlencoded({extended: true});


    // GET /index
    app.get("/index", function (req, res) {

        const query_movies_whole = "SELECT * FROM Movies";

        // Whole movie dataset.
        pool.query(query_movies_whole, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log(result.length)
            movies_dataset = result;

        });



        const query_movies_db = "CALL GetNumberOfMovies()";

        // Max id in movie dataset.
        pool.query(query_movies_db, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            num_of_movies = result[0][0].NumberOfMovies;
            console.log("Number Of Movies : " + num_of_movies);

        });

        // Starter query for Movies Table.
        const starter_query_string = 'SELECT * FROM Movies LIMIT 20';
        pool.query(starter_query_string, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('index',{movies_data: result});
        });

        // Number of users in Ratings dataset.
        const query_number_of_users = "CALL GetNumberOfUsers";
        pool.query(query_number_of_users, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            num_of_users = result[0][0].NumberOfUsers;
            console.log("Number of Users: " + num_of_users);
        });


        // Whole ratings dataset.
        const query_ratings_db = 'SELECT * FROM Ratings';
        pool.query(query_ratings_db, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            ratings_data = result;
            dataset_item_rating_matrix = DatasetItemRatingMatrix(ratings_data);
            console.log("Dataset Item Rating Matrix: " + dataset_item_rating_matrix[3410][3952]);
    });


    });
    // POST /search/ => :movieName as text
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
        res.send(`Data pushed to the user_rate_matrix ${req.body.itemid}`);

    });

    // GET /index/recommend
    app.get("/index/recommend", function(req, res){


        var user_item_matrix = UserItemRatingMatrix(user_rate_array);
        dataset_item_rating_matrix[0] = user_item_matrix;
        var userIndex = 0;
        var movies_data = [];

        // Or we can pass options parameter.
        recommender.getTopCFRecommendations(dataset_item_rating_matrix, userIndex, {limit: 11}, (recommendations) => {

            
            // Whole ratings dataset.
            for(var i=0; i<movies_dataset.length; i++){
                
                for(var j=0; j<recommendations.length; j++){
                    if(movies_dataset[i].MovieID === recommendations[j].itemId){

                        movies_data.push({MovieID: recommendations[j].itemId, Title: movies_dataset[i].Title , Rating: recommendations[j].rating})
                        break;
                    }
                }
            }
            res.render('recommend', {movies_data: movies_data});
        }); 
    });

    function UserItemRatingMatrix(ratingsJson){
        
        console.log("Num Of Movies: " + num_of_movies);
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
    function DatasetItemRatingMatrix(dataset){


        console.log("Dataset length :" + dataset.length);
        //console.log("Number of users is: " + num_of_users);
        dataset_item_rating_matrix = Array(num_of_users+1).fill(0).map(()=>Array(num_of_movies+1).fill(0));
        for(var i=0; i<dataset.length ; i++){
        
            var current_data = dataset[i]
            var movie_id = current_data.MovieID;
            var user_id = current_data.PersonID;
            var rating = current_data.Rating
            dataset_item_rating_matrix[user_id][movie_id] = rating; 

        }
        return dataset_item_rating_matrix;
        
    }
}
