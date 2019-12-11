import firebaseConfig from './firebaseConfig';
import {buildGame, updateGameInfo, lockGame, swapPlayer, autoMove} from './components/board';
import {getPlayers, register} from './firebaseConfig';
import game from './game';
import '../css/style.css';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let sessionRef; // To track the game session - active or not.
let moveRef;  // To track the moves each player made.

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

  }
};

const sessionWatcher = function(snapshot) {
  if (!snapshot.val()) {
    return;
  }
  console.log("Session state change:", snapshot.val());
  if (snapshot.val().length === 2) {
    updateGameInfo({player: null, info: 'Now begins the fight!'});
    console.log("Self", game.self);
    console.log("Active player", game.activePlayer);
    if (game.self === game.activePlayer) {
      lockGame(false);
    }

    moveRef = firebase.database().ref('move');
    moveRef.on('value', moveWatcher);
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

  updateGameInfo({player, info});

  return game.self;
};

buildGame();

lockGame(true);

signIn().then((player) => {
  if (player < 0) {
    return;
  }

  sessionRef = firebase.database().ref('players');
  sessionRef.on('value', sessionWatcher);

  console.log('You are player', player);
});
