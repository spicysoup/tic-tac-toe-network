import firebaseConfig from './firebaseConfig';
import {buildGame, updateGameInfo, lockGame, swapPlayer, autoMove, buildBoard} from './components/board';
import {getPlayers, register, setDimension} from './firebaseConfig';
import game from './game';
import '../css/style.css';
import $ from 'jquery';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let sessionRef; // To track the game session - active or not.
let moveRef;  // To track the moves each player made.
let dimensionRef;  // To track changes to the board dimension.

const moveWatcher = function(snapshot) {
  if (!snapshot.val()) {
    return;
  }
  console.log('New move received', snapshot.val());
  const [row, column, symbol] = snapshot.val();

  if (symbol !== game.selfSymbol()) {
    lockGame(false);
    autoMove([row, column]);
    console.log('The other player moved. Unlock self.');
  } else {
    lockGame(true);
  }
};

const sessionWatcher = function(snapshot) {
  if (!snapshot.val()) {
    console.log("Game has been reset");
    // signIn().then(signInComplete);
    setTimeout(function() {
      location.reload();
    }, Math.floor(Math.random() * 500));
    return;
  }
  console.log("Session state change:", snapshot.val());
  if (snapshot.val().length === 2) {
    updateGameInfo({player: null, info: 'Now begins the fight!'});
    console.log("Self", game.self);
    console.log("Active player", game.activePlayer);
    if (game.self === game.activePlayer) {
      lockGame(false);
      // swapPlayer();
    }

    moveRef = firebase.database().ref('/game/move');
    moveRef.on('value', moveWatcher);
  }
};

const dimensionWatcher = function(snapshot) {
  if (!snapshot.val()) {
    return;
  }

  const newDimension = snapshot.val();
  console.log('New dimension received', newDimension);

  if (newDimension !== game.dimension) {
    $('.dimension').text(newDimension);
    game.initialise(newDimension);
    buildBoard();
    console.log(game.self, game.activePlayer);
    if (game.self !== game.activePlayer) {
      lockGame(true);
      // swapPlayer();
    }
  }
};

const signIn = async function () {
  let players = await getPlayers();
  console.log(players);

  if (players.length >= 2) {
    updateGameInfo({player: null, info: 'Fight in session. Please wait.'});
    return -1;
  }

  let player, info;
  if (players.length === 0) {
    player = 'X';
    info = 'Awaiting player O...';
  } else {
    player = 'O';
    info = 'Now begins the fight!';
  }

  game.self = player === 'X' ? 0 : 1;

  await register(players, player);

  await setDimension(game.dimension);

  updateGameInfo({player, info});

  return game.self;
};

const signInComplete = function(player) {
  if (player < 0) {
    return;
  }

  sessionRef = firebase.database().ref('/game/players');
  sessionRef.on('value', sessionWatcher);

  dimensionRef = firebase.database().ref('/game/dimension');
  dimensionRef.on('value', dimensionWatcher);

  console.log('You are player', player);
};

buildGame();

lockGame(true);

signIn().then(signInComplete);
