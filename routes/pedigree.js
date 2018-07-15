var express = require('express');
var router = express.Router();
var restError = require('../lib/rest-error');
var async = require('async');

// Setup the FS sdk client before handling any requests on this router.
router.use(require('../middleware/fs-client'));

// Make sure the user is signed in before handling any requests on this router.
router.use(require('../middleware/fs-session'));

// When /pedigree is requested, get the user's personId from the session
// and redirect to /pedigree/[personId]. Not only does this allow us to have
// only one route handler for the pedigree but it also makes the URL easier
// for the user to understand and share.
router.get('/', function(req, res){
    res.redirect('/pedigree/' + req.session.user.personId);
});

// Download a person's 8-generation pedigree.
router.get('/:personId', function(req, res, next) {
  
  var fs = req.fs,
      personId = req.params.personId;
  
  // http://caolan.github.io/async/docs.html#autoInject
  // async.autoInject is an easy way for us to specify and manage dependencies
  // between asynchronous tasks.
  async.autoInject({
    
    // Fetch the person's ancestry. We ask for 8 generations which includes the
    // root person and 8 generations beyond (meaning the generations
    // parameter doesn't count the root person as a generation).
    ancestry: function(callback){
      
      // https://familysearch.org/developers/docs/api/tree/Ancestry_resource
      fs.get('/platform/tree/ancestry?generations=8&person=' + personId, function(error, response){
        
        // When requesting a person's ancestry, anything other than an HTTP 200
        // is unexpected and thus we treat it as an error.
        //
        // When `error` is set we won't have a response but the code below will
        // work regardless due to short-circuit evaluation.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_Operators#Short-circuit_evaluation
        if(error || response.statusCode !== 200){
          return callback(error || restError(response));
        }
        
        // Persons returned by the Ancestry resource will include an
        // ascendancyNumber number in their display block. This is an ahnentafel
        // number (Google it) that tells us the person's position in the
        // pedigree. To make the pedigree display easy and fast, we add the 
        // people to a map keyed by that ahnentafel number. Then the pedigree 
        // template can quickly load a person for a position by looking to see
        // if that position's number exists as a key in the ancestry map.
        // This is a O(n) operation.
        //
        // Alternatives include looping through the list each time you want to
        // load a person for a given position, wich is O(n^2), or assembling
        // the pedigree in memory in a nested structure and then recursively
        // traversing that structure in the template (it's as complicated as it
        // sounds).
	
        var ancestry = {};
        response.data.persons.forEach(function(person){
          ancestry[person.display.ascendancyNumber] = person;
		  //console.log(ancestry);
		  //console.log(ancestry[person.display.ascendancyNumber].display['name']);
        });
		var ancestryObject = JSON.stringify(ancestry);
		
		/*
		if (typeof localStorage === "undefined" || localStorage === null) {
		  var LocalStorage = require('node-localstorage').LocalStorage;
		  localStorage = new LocalStorage('./scratch');
		}
		 
		localStorage.setItem('ancestryObject', ancestryObject);
		
		*/
		//console.log(localStorage.getItem('ancestryObject'));
			
        // Notify async.autoInject that we're done with this task and give it
        // the ancestry data so that the data is available for later tasks.
        callback(null, ancestry);
      });
    }
    
  }, function(error, results){
    
    // At this point async.autoInject has finished processing the tasks.
    // If there's an error we pass it on to express which will display the error
    // on the error page. If we successfully retrieved all the data then we
    // pass the data on to the template. The results object will have the
    // properties {ancestry, children} which are the results of the relative
    // tasks above.
    if(error){
      next(error);
    } else {
      res.render('pedigree', results);
    }
  });
});

module.exports = router;
