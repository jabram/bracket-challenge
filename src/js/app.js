import * as firebase from 'firebase';
// import {login, logout, addUser, updateProfile} from './authentication';

const firebaseConfig = {
  apiKey: 'AIzaSyBKr5rTQgpa1JkFoeht3Yy5cggYth08S04',
  authDomain: 'ncaa-brackets.firebaseapp.com',
  databaseURL: 'https://ncaa-brackets.firebaseio.com',
  storageBucket: 'ncaa-brackets.appspot.com',
  messagingSenderId: '863337213626'
}

// DOM elements
const mainContainer = document.getElementById('main');
// const logoutButton = document.getElementById('logout'); // doesn't exist on page load
const googleSignInLink = document.getElementById('googleSignIn');
const signUpForm = document.getElementById('signUp');
const signInForm = document.getElementById('signIn');
const passwordResetLink = document.getElementById('passwordReset');
// const updateProfileButton = document.getElementById('updateProfile'); // doesn't exist on page load
const authMessage = document.querySelector('.auth-message');


// initialize firebase
firebase.initializeApp(firebaseConfig);

function logout() {
  console.log('logging out');

  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log('successfully logged out');
      window.location.reload();  // this is so dumb. SAD!
    }, (error) => {
      console.log('there was an error trying to log you out:', error);
    });
}

function addUser(user, connectionToUs) {
  console.log('adding user to database');
  console.log('name:', user.displayName);
  console.log('connectionToUs:', connectionToUs);

  firebase.database()
    .ref('/users/' + user.uid)
    .set({
      name: user.displayName,
      connectionToUs: connectionToUs,
      bracketReady: false
    })
    .catch(error => {
      console.log('error adding user to database:', error);
    });
}

function processGoogleLogin(e) {
  console.log('processing google login');
  e.preventDefault();

  const provider = new firebase.auth.GoogleAuthProvider();

  firebase
    .auth()
    .signInWithRedirect(provider);

  firebase
    .auth()
    .getRedirectResult()
    .catch(error => {
      console.log('google sign in error! ' + error.code + ': ' + error.message);
      authMessage.innerHTML = 'google sign in error! ' + error.code + ': ' + error.message;
      authMessage.style.display = 'block';
    });
}

function processRegistration(e) {
  console.log('processing registration');
  e.preventDefault();

  let displayName = this.querySelector('[name="displayName"]').value;
  let email = this.querySelector('[name="email"]').value;
  let password = this.querySelector('[name="password"]').value;
  let connectionToUs = this.querySelector('[name="connectionToUs"]').value;

  firebase.auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      console.log('done creating new user:', user);
      user
        .updateProfile({
          displayName: displayName
        })
        .then(() => {
          console.log('done updating user with displayName');
          addUser(user, connectionToUs);
        })
        .catch(error => {
          console.log('error updating user profile:', error);
        });
    })
    .catch(error => {
      console.log('registration error! ' + error.code + ': ' + error.message);
      authMessage.innerHTML = 'registration error! ' + error.code + ': ' + error.message
      authMessage.style.display = 'block';
    });
}

function processLogin(e) {
  console.log('processing login');
  e.preventDefault();

  let email = this.querySelector('[name="email"]').value;
  let password = this.querySelector('[name="password"]').value;

  firebase.auth()
    .signInWithEmailAndPassword(email, password)
    .catch(error => {
      console.log('sign in error! ' + error.code + ': ' + error.message);
      authMessage.innerHTML = 'sign in error! ' + error.code + ': ' + error.message;
      authMessage.style.display = 'block';
    });
}

function passwordReset(e) {
  console.log('sending password reset email');
  e.preventDefault();

  let email = signInForm.querySelector('[name="email"]').value;
  console.log('sending to ', email);

  if (email) {
    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        console.log('email sent');
        authMessage.innerHTML = 'an email has been sent to ' + email + ' with instructions for resetting your password. if you don\'t receive it in a few minutes, try this process again.';
        authMessage.style.display = 'block';
      }, (error) => {
        console.log('error sending email:' + error.code + ': ' + error.message);
        authMessage.innerHTML = 'error sending email! ' + error.code + ': ' + error.message;
        authMessage.style.display = 'block';
      });
  } else {
    authMessage.innerHTML = 'please make sure to enter your email address in the box above before clicking the "send a password reset email" link!';
    authMessage.style.display = 'block';
  }
}

function updateProfile() {
  console.log('need to update profile');
  // TODO: see https://firebase.google.com/docs/auth/web/manage-users for updating profile and email address
}



/*
function showScoreboard() {
  console.log('showing scoreboard');
  // TODO: first need to check if user's bracket is ready to be filled out

  const currentUserElement = document.querySelector('.currentUser');

  // WRONG!
  if (window.location.pathname !== '/') {
    window.location = '/';
  }

  if (currentUserElement) {
    currentUserElement.innerHTML = firebase.auth().currentUser.email;
  }
}

function showWelcome() {
  console.log('need to show the welcome view (ie bracket isn\'t ready yet)');
}

// sends request to verify user's email if it isn't already
function checkEmailVerification(user) {
  if (!user.emailVerified) {
    // TODO maybe: configure email template? https://support.google.com/firebase/answer/7000714
    // also TODO: maybe store this in db? only send email once and just display a message the second time?
    user
      .sendEmailVerification()
      .then(() => {
        console.log('sent verification email');
        // TODO: update an element with message that says to verify email?
      }, error => {
        console.log('error sending verification email:', error);
      });
  } else {
    console.log('user email already verified');
  }
}

// test if user is stored in database yet
function checkUserRecord(user) {
  console.log('checking user record');

  firebase.database()
    .ref('/users/' + user.uid)
    .once('value')  // read this only once
    .then(snapshot => {
      console.log('user snapshot:', snapshot.val());
      if (!snapshot.val()) {
        addUser(user, '', showWelcome);
      } else {
        console.log('user exists!');
        if (snapshot.val().bracketReady) {
          showScoreboard();
        } else {
          // bracket isn't ready yet, show the welcome page
          showWelcome();
        }
      }
    }, error => {
      console.log('error getting user data from database');
    });
}
*/




function init() {
  console.log('initializing app...');

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // logged in
      if (window.location.pathname === '/login.html' || window.location.pathname === '/register.html') {
        console.log('logged in, redirecting to index page');
        window.location = '/';
      } else {
        console.log('logged in, need to show stuff');

        mainContainer.innerHTML = `
          <p>scoreboard will go here</p>
          <p>you are logged in as ${user.displayName} <button id="updateProfile">update profile</button> <button id="logout">log out</button></p>
        `;

        const logoutButton = document.getElementById('logout'); // doesn't exist on page load
        const updateProfileButton = document.getElementById('updateProfile'); // doesn't exist on page load

        logoutButton.addEventListener('click', logout);
        updateProfileButton.addEventListener('click', updateProfile);





        // TODO: LEFT OFF HERE!!!!!!!!!!
          // need to:
          // check if email is verified
          // check if user has been added to database (google sign in users haven't been, need connectionToUs)
          // ability to update profile information
          // use handlebars for different views?
          // check if bracketReady (display welcome message if not or scoreboard if ready)



        // checkEmailVerification(user); // sends request to verify user's email if it isn't already
        // checkUserRecord(user);        // test if user is stored in database yet



      }

    } else {
      // not logged in
      if (window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
        console.log('not logged in, redirecting to login page');
        window.location = 'login.html';
      }
    }
  }, (error) => {
    console.log('error attempting to authenticate firebase:', error);
  });


  // event listeners
  /* doesn't exist on page load
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
  */

  if (googleSignInLink) {
    googleSignInLink.addEventListener('click', processGoogleLogin);
  }

  if (signUpForm) {
    signUpForm.addEventListener('submit', processRegistration);
  }

  if (signInForm) {
    signInForm.addEventListener('submit', processLogin);
  }

  if (passwordResetLink) {
    passwordResetLink.addEventListener('click', passwordReset);
  }

  /* doesn't exist on page load
  if (updateProfileButton) {
    updateProfileButton.addEventListener('click', updateProfile);
  }
  */

}

window.addEventListener('load', init);
