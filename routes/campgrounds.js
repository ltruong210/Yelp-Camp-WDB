var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// INDEX ROUTE
router.get("/", function(req, res) {
   //Get all campgrounds from DB
   Campground.find({}, function(err, campgrounds) {
       if(err || !campgrounds) {
           req.flash("error", "There is no campgrounds in database!");
           res.redirect("back");
       } else {
           res.render("campgrounds/index", {campgrounds : campgrounds});
       }
   })
});

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {
        name: name, 
        image: image, 
        price : price, 
        description: desc, 
        author: author
        
    };
    
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err) {
            console.log(err);
        } else {
            // redirect to campground page
            console.log(newlyCreated);
            res.redirect("/campgrounds");        
        }
    })
    ;
});

// SHOW ROUTE
router.get("/:id", function(req, res) {
    //find the campground with id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err || !foundCampground) {
           req.flash("error", "Campground not found!");
           res.redirect("back");
       } else {
            //render this campground
            res.render("campgrounds/show", {campground: foundCampground});       
       }
    });
    
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {
            // does user own the campground?
            res.render("campgrounds/edit", {campground: foundCampground});
         
        }
    });

    
});

// UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "You have successfully updated the campground.")
            res.redirect("/campgrounds/" + updatedCampground._id);
        }
    })
});

// DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "You have successfully deleted the campground.");
            res.redirect("/campgrounds");
        }
    })
});


module.exports = router;