// Create map on page load \\

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelectorAll('#map').length > 0) {
        if (document.querySelector('html').lang)
            lang = document.querySelector('html').lang;
        else
            lang = 'en';

        var js_file = document.createElement('script');
        js_file.type = 'text/javascript';
        js_file.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaSVlHx6Mx2guFHDJUQTWgI-ZUf7dyUjw&callback=launchMap&language=' + lang;
        document.getElementsByTagName('head')[0].appendChild(js_file);
    }
});


// Set map to initial point \\

function launchMap() {
    var myLocation = {
        lat: 31.2397,
        lng: 121.4998
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.2397,
            lng: 121.4998
        },
        zoom: 14
    });
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
            position: myLocation,
            pov: {
                heading: 34,
                pitch: 10
            }
        });
    map.setStreetView(panorama);
}

// Set map to target address lat + long \\

function initMap() {
    var myLocation = {
        lat: +lat,
        lng: +long
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: +lat,
            lng: +long
        },
        zoom: 14
    });
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
            position: myLocation,
            pov: {
                heading: 34,
                pitch: 10
            }
        });
    map.setStreetView(panorama);
}