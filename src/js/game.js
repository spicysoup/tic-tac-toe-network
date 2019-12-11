class Player {
  constructor(symbol) {
    this.symbol = symbol;
  }
}

const game = {
  board: [[]],  // Main data structure for the game board

  dimension: 1,
  players: [
    new Player('X'),
    new Player('O'),
  ],
  activePlayer: 0,  // The player who is to take a move now
  self: -1, // This is specific to the network edition, to track the current player

  /**
   * A helper method to return the symbol for the "self" player.
   *
   * @returns {string|RemoteObject | *}
   */
  selfSymbol: function() {
    if (this.self < 0) {
      return '';
    }
    return this.players[this.self].symbol;
  },

  /**
   * A helper data structure to help with "board slicing"
   *
   * @returns {any[]}
   */
  axis: function() {
    return new Array(this.dimension).fill(0);
  },

  /**
   * Diagonal of the board - top-left to bottom-right.
   *
   * @param withCoordinates Whether or not to include the coordinates along with the cell content.
   * @returns {*[][]|*[]}
   */
  diagonal1: function(withCoordinates = false) {
    const axis = this.axis();

    if (withCoordinates) {
      return axis.map((v, i) => [i, i, this.board[i][i]]);
    } else {
      return axis.map((v, i) => this.board[i][i]);
    }
  },

  /**
   * Diagonal of the board - top-right to bottom-left.
   *
   * @param withCoordinates Whether or not to include the coordinates along with the cell content.
   * @returns {*[][]|*[]}
   */
  diagonal2: function(withCoordinates = false) {
    const axis = this.axis();

    if (withCoordinates) {
      return axis.map((v, i) => [
        i,
        this.dimension - i - 1,
        this.board[i][this.dimension - i - 1]]);
    } else {
      return axis.map((v, i) => this.board[i][this.dimension - i - 1]);
    }
  },

  initialise: function(dimension) {
    this.dimension = dimension;

    const matrix = new Array(dimension);
    for (let i = 0; i < dimension; i++) {
      matrix[i] = new Array(dimension).fill('');
    }
    this.board = matrix;
  },

  /**
   * Returns the "critical paths" - horizontal, vertical and two diagonals - in
   * the following format:
   *
   * [
   *  [[r, c, symbol], [r, c, symbol], [r, c, symbol], [r, c, symbol]], // Horizontal line
   *  [[r, c, symbol], [r, c, symbol], [r, c, symbol], [r, c, symbol]], // Vertical line
   *  [[r, c, symbol], [r, c, symbol], [r, c, symbol], [r, c, symbol]], // Diagonal (r==c)
   *  [[r, c, symbol], [r, c, symbol], [r, c, symbol], [r, c, symbol]], // Diagonal (r + c + 1 == dimension)
   * ]
   * @param row
   * @param column
   * @returns {[*[][], *[][], null, null]}
   */
  criticalPaths: function(row, column) {
    const axis = this.axis();

    const horizontalPath = axis.map(
        (v, i) => [row, i, this.board[row][i]]);

    const verticalPath = axis.map(
        (v, i) => [i, column, this.board[i][column]]);

    const diagonalPath1 = row === column
        ? this.diagonal1(true) : null;

    const diagonalPath2 = row + column + 1 === this.dimension
        ? this.diagonal2(true)
        : null;

    return [horizontalPath, verticalPath, diagonalPath1, diagonalPath2];
  },

  /**
   * Find out if there's a draw.
   * There is a draw when each row, column and diagonal has at least two different symbols.
   *
   * @returns {boolean}
   */
  isDraw: function() {
    const axis = this.axis();
    const nonEmpty = (v) => v !== '';
    const allSame = (v, i, a) => v === a[0];

    for (let rc = 0; rc < this.dimension; rc++) {
      if (this.board[rc].filter(nonEmpty).every(allSame)) {
        return false;
      }
      if (axis.map((v, i) => this.board[i][rc]).
          filter(nonEmpty).every(allSame)) {
        return false;
      }
    }
    if (this.diagonal1().filter(nonEmpty).every(allSame)) {
      return false;
    }
    if (this.diagonal2().filter(nonEmpty).every(allSame)) {
      return false;
    }
    return true;
  },

  /**
   * Check if the given cell has caused a winning situation.
   *
   * @param row
   * @param column
   * @returns {null|T} The winning path
   */
  checkWin: function(row, column) {
    const criticalPaths = this.criticalPaths(row, column);

    const completePaths = criticalPaths.filter(
        (p) => p !== null && !(p.map((v) => v[2]).includes('')));

    for (const completePath of completePaths) {
      for (const player of this.players) {
        if (completePath.map((v) => v[2]).every((w) => w === player.symbol)) {
          return completePath;
        }
      }
    }
    return null;
  },

  reset: function() {
    for (let r = 0; r < this.dimension; r++) {
      for (let c = 0; c < this.dimension; c++) {
        this.board[r][c] = '';
      }
    }
  },
};

export default game;