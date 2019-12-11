import $ from "jquery";
import game from '../game';
import {move, reset as resetDatabase} from '../firebaseConfig';

const DIMENSION_MIN = 3;
const DIMENSION_MAX = 8;

const buildBoard = function() {
  $('.board').empty();
  for (let i = 0; i < game.dimension * game.dimension; i++) {
    const coordinates = `${Math.floor(i / game.dimension)},${i %
    game.dimension}`;
    const $cell = $(`<div class="cell"></div>`);
    $cell.css({
      width: `calc(${1 / game.dimension * 100}% - 2px)`,
      height: `calc(${1 / game.dimension * 100}% - 2px)`,
    });
    $cell.attr('data-cell',
        coordinates);
    $('.board').append($cell);
  }
};

const buildPlayers = function() {
  $('.player-a').text(game.players[0].symbol);
  $('.player-b').text(game.players[1].symbol);
};

const highlightWinners = function($winner, winningPath) {
  const winner = winningPath[0][2];

  winningPath.forEach(([r, c]) => {
    $(`[data-cell="${r},${c}"]`).addClass('winning-cell');
  });
};

export const swapPlayer = function() {
  const nextPlayerID = -1 * (game.activePlayer - 1);
  let $nextPlayer = $(`[data-player-id=${nextPlayerID}]`);
  $('.player').removeClass('active-player');
  $nextPlayer.addClass('active-player');
  game.activePlayer = nextPlayerID;
};

const lockGame = function(lock) {
  if (lock) {
    $('.cell').addClass('no-op');
  } else {
    $('.cell').removeClass('no-op');
  }
};

const resetGame = function() {
  game.reset();
  resetDatabase();
  $('.cell').text('');
  $('.cell').removeClass('winning-cell');
  $('.draw').hide();
  $('.dimension-control').show();
  lockGame(false);
};

const updateGameInfo = function({player = null, info=null}) {
  if (player) {
    $('.info h1').text(`You are player [${player}]`);
  }

  if (info) {
    $('.info h2').text(info);
  }
};

export const autoMove = function([row, column]) {
  console.log('Auto move');
  console.log(row, column);
  console.log($(`.cell[data-cell="${row},${column}"]`));
  $(`.cell[data-cell="${row},${column}"]`).trigger('click');
};

const buildGame = function() {
  $('.board').click(function(event) {
    console.log("Clicked!!!");
    const $target = $(event.target);

    if ($target.hasClass('no-op')) {
      return;
    }

    console.log("Still going");

    let coordinates;
    if ((coordinates = $target.attr('data-cell'))) {
      const [row, column] = coordinates.split(',').map((c) => parseInt(c));

      if (game.board[row][column] !== '') {
        return;
      }

      $target.css({
        'line-height': $target.css('height'),
      });

      const symbol = game.players[game.activePlayer].symbol;
      // console.log($target.width());
      $target.css('font-size', `${$target.width() - 1}px`);
      $target.text(symbol);

      $('.cell').not(':empty').addClass('no-op');

      game.board[row][column] = symbol;
      move([row, column, symbol]);

      // $target.addClass('no-op');

      const winningPath = game.checkWin(row, column);
      if (winningPath !== null) {
        highlightWinners($target, winningPath);
        lockGame(true);
      } else {
        if (game.isDraw()) {
          $('.dimension-control').hide();
          $('.draw').show();
          lockGame(true);
        }
        swapPlayer();
      }
    }
  });

  $(window).on('resize', function() {
    const $cells = $('.cell');
    const width = $cells.eq(0).width();
    $cells.css({
      'font-size': `${width - 1}px`,
      'line-height': `${width}px`,
    })
  });

  $('.player').click(function(event) {
    return;

    $('.player').removeClass('active-player');
    let $player = $(event.target);
    $player.addClass('active-player');
    game.activePlayer = parseInt($player.attr('data-player-id'));
  });

  $('.control-panel button').click(resetGame);

  $('.dimension-button').click(function(event) {
    const $target = $(event.target);
    if ($target.attr('data-dimension-control') === 'up') {
      game.dimension++;
      if (game.dimension > DIMENSION_MAX) {
        game.dimension = DIMENSION_MIN;
      }
    } else {
      game.dimension--;
      if (game.dimension < DIMENSION_MIN) {
        game.dimension = DIMENSION_MAX;
      }
    }

    $('.dimension').text(game.dimension);
    game.initialise(game.dimension);
    buildBoard();
  });

  game.initialise(4);
  buildBoard();
  buildPlayers();
};

export {buildGame, updateGameInfo, lockGame};