import $ from "jquery";
import game from '../game';
import {move, reset as resetDatabase, clear as clearGame, setDimension} from '../firebaseConfig';

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

const swapPlayer = function() {
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

/**
 * This will be called when the peer made a move.
 * It replays the peer's move on my own board.
 *
 * @param row
 * @param column
 */
const autoMove = function([row, column]) {
  $(`.cell[data-cell="${row},${column}"]`).trigger('click');
};

const moveHandler = function(event) {
  const $target = $(event.target);

  if ($target.hasClass('no-op')) {
    return;
  }

  let coordinates;
  if ((coordinates = $target.attr('data-cell'))) {
    const [row, column] = coordinates.split(',').map((c) => parseInt(c));

    if (game.board[row][column] !== '') {
      return;
    }

    // This is to make the symbol align vertically in the cell.
    $target.css({
      'line-height': $target.css('height'),
    });

    const symbol = game.players[game.activePlayer].symbol;

    $target.css('font-size', `${$target.width() - 1}px`);
    $target.text(symbol);

    $('.cell').not(':empty').addClass('no-op');

    game.board[row][column] = symbol;

    // Send the move to the database.
    move([row, column, symbol]);

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
};

const boardResizeHandler = function() {
  const $cells = $('.cell');
  const width = $cells.eq(0).width();
  $cells.css({
    'font-size': `${width - 1}px`,
    'line-height': `${width}px`,
  })
};

const playerSwapHandler = function(event) {
  $('.player').removeClass('active-player');
  let $player = $(event.target);
  $player.addClass('active-player');
  game.activePlayer = parseInt($player.attr('data-player-id'));
};

const dimensionChangeHandler = function(event) {
  const $target = $(event.target);
  let dimension = game.dimension;
  if ($target.attr('data-dimension-control') === 'up') {
    dimension++;
    if (dimension > DIMENSION_MAX) {
      dimension = DIMENSION_MIN;
    }
  } else {
    dimension--;
    if (dimension < DIMENSION_MIN) {
      dimension = DIMENSION_MAX;
    }
  }

  $('.dimension').text(dimension);

  setDimension(dimension);
  clearGame();

  // game.initialise(game.dimension);
  // buildBoard();
};

const buildGame = function() {
  $('.board').click(moveHandler);

  $(window).on('resize', boardResizeHandler);

  // We removed the capability to manually swap players in network edition.
  $('.player').click(() => {});

  $('.control-panel button').click(resetGame);

  $('.dimension-button').click(dimensionChangeHandler);

  game.initialise(4);

  buildBoard();
  buildPlayers();
};

export {buildGame, updateGameInfo, lockGame, autoMove, swapPlayer, buildBoard};