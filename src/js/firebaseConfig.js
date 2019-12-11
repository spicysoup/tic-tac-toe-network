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
  return firebase.database().ref('/game/players').once('value').then(function(snapshot) {
    const user = snapshot.val() || [];
    console.log(user);
    return user;
    // ...
  });
};

export const register = function(existingPlayer, player) {
  return firebase.database().ref('/game/players').set([...existingPlayer, player]);
};

export const move = function([row, column, symbol]) {
  return firebase.database().ref('/game/move').set([row, column, symbol]);
};

export const reset = function() {
  return firebase.database().ref('/game').remove();
};

export const clear = function() {
  return firebase.database().ref('/game/move').remove();
};

export const setDimension = function(dimension) {
  return firebase.database().ref('/game/dimension').set(dimension);
};