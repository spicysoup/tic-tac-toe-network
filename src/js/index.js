import firebaseConfig from './firebaseConfig';
import {
  buildGame,
  updateGameInfo,
  lockGame,
  autoMove,
  buildBoard,
} from './components/board';
import {getSessionID, register, setDimension} from './firebaseConfig';
import game from './game';
import '../css/style.css';
import $ from 'jquery';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let sessionRef; // To track the game session - active or not.
let moveRef;  // To track the moves each player made.
let dimensionRef;  // To track changes to the board dimension.

/**
 * Watch for the "move" that's been taken by my peer,
 * and "replay" it on my own board.
 *
 * @param snapshot
 */
const moveWatcher = function(snapshot) {
  if (!snapshot.val()) {
    return;
  }
  // New move received.
  const [row, column, symbol] = snapshot.val();

  if (symbol !== game.selfSymbol()) {
    // The other player moved. Unlock self.
    lockGame(false);
    autoMove([row, column]);
  } else {
    lockGame(true);
  }
};

/**
 * Watch for the start of a game session.
 * If both players are present, start the game.
 *
 * @param snapshot
 */
const sessionWatcher = function(snapshot) {
  if (!snapshot.val()) {
    // Game has been reset because the players info has gone missing.
    // Introduce some random delay to avoid deadlock.
    setTimeout(function() {
      location.reload();
    }, Math.floor(Math.random() * 500));
    return;
  }

  // Both players have come online.
  if (snapshot.val().length === 2) {
    updateGameInfo({player: null, info: 'Now begins the fight!'});
    // If I'm the one to move first, unlock my board, and the game begins.
    if (game.self === game.activePlayer) {
      lockGame(false);
    }
  }
};

/**
 * Handle the change to the board dimension mid game session.
 * If the dimension has been changed, we will have to reset the
 * board.
 *
 * @param snapshot
 */
const dimensionWatcher = function(snapshot) {
  if (!snapshot.val()) {
    return;
  }

  const newDimension = snapshot.val();

  // Reset the existing moves, but not the players info.
  if (newDimension !== game.dimension) {
    $('.dimension').text(newDimension);

    game.initialise(newDimension);
    buildBoard();

    // Re-apply the board lock.
    if (game.self !== game.activePlayer) {
      lockGame(true);
    }
  }
};

/**
 * Handle the "check-in" process of players.
 * Whoever arrives first will be assigned "X" and gets to move first.
 *
 * @returns {Promise<number>} The assigned symbol's numeric identification. 0: X; 1: O; -1: (wait)
 */
const signIn = async function() {
  let sessionID = await getSessionID();

  let player, info;

  if (sessionID < 0) {
    sessionID = Date.now();
    player = 'X';
    info = 'Awaiting player O...';
  } else {
    player = 'O';
    info = 'Now begins the fight!';
  }

  // Push the newly checked in player to the database.
  await register(player, sessionID);

  // Write the initial dimension to the database.
  await setDimension(game.dimension, sessionID);

  // Update the UI.
  updateGameInfo({player, info});

  game.self = player === 'X' ? 0 : 1;
  game.sessionID = sessionID;

  return game.self;
};

/**
 * Handle the post-check-in process, to register various "database value changed" handlers.
 * @param player
 */
const signInComplete = function(player) {
  if (player < 0) {
    return;
  }

  // Subscribe to the "game session" data in the database.
  sessionRef = firebase.database().ref(`/game/${game.sessionID}/players`);
  sessionRef.on('value', sessionWatcher);

  // Subscribe to the "dimension change" data in the database.
  dimensionRef = firebase.database().ref(`/game/${game.sessionID}/dimension`);
  dimensionRef.on('value', dimensionWatcher);

  // Subscribe to the "move" data in the database.
  moveRef = firebase.database().ref(`/game/${game.sessionID}/move`);
  moveRef.on('value', moveWatcher);
};

// Draw the main UI.
buildGame();

// Lock up the board by default
lockGame(true);

// Check in new player
signIn().then(signInComplete);