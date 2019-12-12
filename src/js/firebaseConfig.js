export default {
  apiKey: 'AIzaSyCvFlF_-RvHpUSt4EISWYUZD9-nE7mbXBI',
  authDomain: 'tic-tac-toe-5a414.firebaseapp.com',
  databaseURL: 'https://tic-tac-toe-5a414.firebaseio.com',
  projectId: 'tic-tac-toe-5a414',
  storageBucket: 'tic-tac-toe-5a414.appspot.com',
  messagingSenderId: '819894234646',
  appId: '1:819894234646:web:bb289aaa2a688da6bb8f37',
};

export const getSessionID = function() {
  return firebase.database().
      ref('/game').
      once('value').
      then(function(snapshot) {
        const sessions = snapshot.val() || [];

        if (sessions.length === 0) {
          return -1;
        }

        const sessionIDs = Object.keys(sessions);

        const availableSessionIDs = sessionIDs.filter(
            (s) => sessions[s].players.length < 2);
        if (availableSessionIDs.length === 0) {
          return -1;
        }
        return availableSessionIDs[0];
      });
};

export const register = function(player, sessionID) {
  return firebase.database().
      ref(`/game/${sessionID}/players`).
      set(player === 'X' ? [player] : ['X', player]);
};

export const move = function([row, column, symbol], sessionID) {
  return firebase.database().
      ref(`/game/${sessionID}/move`).
      set([row, column, symbol]);
};

export const reset = function(sessionID) {
  return firebase.database().ref(`/game/${sessionID}`).remove();
};

export const clear = function(sessionID) {
  return firebase.database().ref(`/game/${sessionID}/move`).remove();
};

export const setDimension = function(dimension, sessionID) {
  return firebase.database().ref(`/game/${sessionID}/dimension`).set(dimension);
};

export const setRound = function(round, sessionID) {
  return firebase.database().ref(`/game/${sessionID}/round`).set(round);
};