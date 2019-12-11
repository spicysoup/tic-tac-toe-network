import firebaseConfig from './firebaseConfig';
// import game from './game';
import {buildGame, updateGameInfo} from './components/board';
import {getPlayers, register} from './firebaseConfig';
import '../css/style.css';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log('Database', firebase);
console.log(firebaseConfig);

function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}

writeUserData('test', 'Bob', 'bob@example.com', 'https://google.com');

const test = async function f() {
  let players = await getPlayers();
  console.log(players);

  if (players.length >= 2) {
    updateGameInfo({player: null, info: 'Fight in session. Please wait.'})
    return;
  }

  let player, info;
  if (players.length === 0) {
    player = 'X';
    info = 'Awaiting player O...';
  } else {
    player = 'O';
    info = 'Now begins the fight!';
  }

  await register(players, player);

  updateGameInfo({player, info})
  players = await getPlayers();
  console.log(players);

};

buildGame();

test();
