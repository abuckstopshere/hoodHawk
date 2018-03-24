// Initialize Firebase
var config = {
    apiKey: "AIzaSyCtlBri34np_cnJEmGy_mDiz-d-3B7tmbk",
    authDomain: "hood-hawk.firebaseapp.com",
    databaseURL: "https://hood-hawk.firebaseio.com",
    projectId: "hood-hawk",
    storageBucket: "",
    messagingSenderId: "360803796367"
};
firebase.initializeApp(config);

//GLOBAL VARIABLES
var newAdd = ''
var newZip = ''
var database = firebase.database().ref()
var users = firebase.database().ref().child('users')
var txtEmail = document.getElementById('txtEmail')
var txtPassword = document.getElementById('txtPassword')
var signIn = document.getElementById('signIn')
var signUp = document.getElementById('signUp')
var logout = document.getElementById('logout')
var uid = ''

// Main sign in function
if (signIn) {
    signIn.addEventListener('click', function(event) {
        event.preventDefault()
        var email = txtEmail.value;
        var pass = txtPassword.value;
        var auth = firebase.auth()
        var promise = auth.signInWithEmailAndPassword(email, pass)
        promise.catch(e => console.log(e.message))
        setTimeout(logIn, 4000)
    })
}

function logIn() {
    window.location = "https://ryanv027.github.io/hoodhawk-ghetto/logged.html"
}

//logout function
logout.addEventListener('click', function() {
    firebase.auth().signOut();
    window.location = "https://ryanv027.github.io/hoodhawk-ghetto/index.html"
})

//sign up function
if (signUp) {
    signUp.addEventListener('click', function(event) {
        event.preventDefault()
        var email = txtEmail.value;
        var pass = txtPassword.value;
        var auth = firebase.auth();
        firebase.auth().createUserWithEmailAndPassword(email, pass)
            .then(function(response) {
                console.log(response.uid);

                firebase.database().ref("users/" + response.uid).set({
                    email: email,
                    displayName: "display"
                });
            });
        window.location = "https://ryanv027.github.io/hoodhawk-ghetto/logged.html"
    })
}
//listens for an authentication sign in and updates uid so we can retrieve stored info
firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            uid = user.uid
            retrieve()
        } else {
            console.log('not logged in')
        }
    })
    //retrieves the stored favorite info and displays it on html 
function retrieve() {
    firebase.database().ref('/users/' + uid).once('value').then(function(snapshot) {
        console.log(snapshot.val())

        newAdd = snapshot.val().favoriteAdd
        newZip = snapshot.val().favoriteZip
        console.log(snapshot.val().favoriteZip)
        console.log(snapshot.val().favoriteAdd)
        if (newAdd !== undefined && newZip !== undefined) {
            $('#favoriteDisplay').html(`<button id='populate'>click me</button><br><p>${newAdd}</p>`)
            $('#favoriteDisplay').append(`<br>${newZip}<br><button id='delete'>delete fav</button>`)
        } else {
            return false
        }

    })
}
//an onclick function that makes an ajax call from the favorites
$('body').on('click', '#populate', function() {
        initial(newAdd, newZip)
    })
    //an onclick function that will delete the favorites from the firebase database
$('body').on('click', '#delete', function() {
        firebase.database().ref('/users/' + uid).update({
            favoriteAdd: null,
            favoriteZip: null
        })
        $('#favoriteDisplay').html('')
    })
    //an onclick function that will update firebase database with favorites information
$('body').on('click', '#favorites', function() {
    console.log('fav button working')
    firebase.database().ref('/users/' + uid).update({
        favoriteAdd: address,
        favoriteZip: zipCode
    })
    $('#favoriteDisplay').html(`<button id='populate'>click me</button><br><p>${address}</p>`)
    $('#favoriteDisplay').append(`<br>${zipCode}<br><button id='delete'>delete fav</button>`)

})