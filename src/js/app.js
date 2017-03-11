import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyBKr5rTQgpa1JkFoeht3Yy5cggYth08S04',
  authDomain: 'ncaa-brackets.firebaseapp.com',
  databaseURL: 'https://ncaa-brackets.firebaseio.com',
  storageBucket: 'ncaa-brackets.appspot.com',
  messagingSenderId: '863337213626'
}

// initialize firebase
firebase.initializeApp(firebaseConfig);

function init() {
  console.log('checking if current user is authenticated');

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // logged in
      console.log('logged in, need to show stuff');

    } else {
      // not logged in
      console.log('need to authenticat user');
    }
  }, (error) => {
    console.log('error attempting to authenticate firebase:', error);
  });
}

window.addEventListener('load', init);
