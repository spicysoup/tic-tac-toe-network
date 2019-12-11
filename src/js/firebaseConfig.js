export default {
  apiKey: 'AIzaSyCvFlF_-RvHpUSt4EISWYUZD9-nE7mbXBI',
  authDomain: 'tic-tac-toe-5a414.firebaseapp.com',
  databaseURL: 'https://tic-tac-toe-5a414.firebaseio.com',
  projectId: 'tic-tac-toe-5a414',
  storageBucket: 'tic-tac-toe-5a414.appspot.com',
  messagingSenderId: '819894234646',
  appId: '1:819894234646:web:bb289aaa2a688da6bb8f37',
};

export const getPlayers = function() {
  return firebase.database().ref('/players').once('value').then(function(snapshot) {
    const user = snapshot.val() || [];
    console.log(user);
    return user;
    // ...
  });
};

export const register = function(existingPlayer, player) {
  return firebase.database().ref('players').set([...existingPlayer, player]);
};