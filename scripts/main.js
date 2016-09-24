import {users} from './kinvey/users.js';
import {books} from './kinvey/books.js';
import {templates} from './kinvey/templates.js';
import {getWeather} from './weather/get-weather.js';
import {maps} from './maps/create-map.js';

import {profileScreen} from './profile/profileScreen.js';

var sammyApp = Sammy("#content", function () {
    var $content = $("#content"),
        $weatherInfo = $("#weather");

    this.get("#/", function () {
        $content.html("GOsho");
        var loggedUser = users.isUserLogged();
        if (loggedUser) {
            $content.html(loggedUser.username);

            users.getUserLocations()
                .then(function (response) {
                    console.log(response);
                });

            //Test non-added location
            var locationName = "Gorna Banq";
            users.setUserLocations(locationName)
                .then(function (response) {
                    console.log(response);
                });
        }
    });

    this.get("#/login", function (context) {
        if (users.isUserLogged()) {
            context.redirect('#/');
            return;
        }

        templates.get("login")
            .then(function (template) {
                $content.html(template());

                $("#btn-login").on("click", function () {
                    var logUser = {
                        username: $('#username').val(),
                        password: $('#password').val()
                    };

                    users.login(logUser)
                        .then(function (response) {
                            context.redirect('#/profile');
                            document.location.reload(true);
                        });
                });
            });
    });

    this.get("#/register", function (context) {
        if (users.isUserLogged()) {
            context.redirect('#/');
            return;
        }

        templates.get("register")
            .then(function (template) {
                $content.html(template());

                $("#btn-register").on("click", function () {
                    var newUser = {
                        username: $('#new-username').val(),
                        password: $('#new-username').val()
                    }

                    users.register(newUser)
                        .then(function (response) {
                            context.redirect('#/');
                            document.location.reload(true);
                        });
                });
            });
    });


    this.get('#/profile', function () {
        // Profile Screen
        // No locations added version.
        // Locations List section.
        // Weather display section.
        // Add location section
        startProfileScreen();
    });

    this.get('#/profile/:location/:duration', function (route) {
        // Display weather location
        // for params.location
        // with params.duration
        const profileScreen = $('#profile-screen');
        if (profileScreen.length === 0) {
            startProfileScreen();
        }

        //One day get weather map and weather-info done

        //     getWeather.oneDay(route.params.location)
        //         .then(function(data) {
        //             maps.initializeMap(
        //                 data.coord.lat,
        //                 data.coord.lon,
        //                 document.getElementById('map-container')
        //             );
        //
        //
        //             return data;
        //         })
        //         .then(function(data){
        //             Promise.all([data,templates.get("current-weather")])
        //                 .then(function ([data,template]) {
        //
        //                     $("#weather").html(template(data));
        //                 })
        //         });
        // });

        // WORKING, COMMENTED JUST FOR NOW

        //     getWeather.fiveDay(route.params.location)
        //         .then(function(data) {
        //             maps.initializeMap(
        //                 data.city.coord.lat,
        //                 data.city.coord.lon,
        //                 document.getElementById('map-container')
        //             );
        //
        //
        //             return data;
        //         })
        //         .then(function(data){
        //             Promise.all([data,templates.get("five-day")])
        //                 .then(function ([data,template]) {
        //                      $("#weather").html(template(data));
        //                 })
        //         });
        // });

        getWeather.fourteenDay(route.params.location)
            .then(function (data) {
                maps.initializeMap(
                    data.city.coord.lat,
                    data.city.coord.lon,
                    document.getElementById('map-container')
                );


                return data;
            })
            .then(function (data) {
                Promise.all([data, templates.get("fourteen-day")])
                    .then(function ([data, template]) {
                        $("#weather").html(template(data));
                    })
            });
    });

    this.get('#/profile/add', function (route) {
        const newLocation = $('#input-location').val();
        if (!newLocation) {
            return;
        }

        users.setUserLocations(newLocation);
        startProfileScreen();
        window.location = `#/profile/${newLocation}/1`;
    });

    function startProfileScreen() {
        profileScreen.start('#content');
        profileScreen.displayLocationsListForUser('#location-list');
    }
});

//logout
$("#nav-btn-logout").on("click", function () {
    users.logout()
        .then(function () {
            location = "#/";
            document.location.reload(true);
        });
});

$(function () {
    sammyApp.run("#/");
});