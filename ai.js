// AI opponent: random (easy), tactical (medium), minimax for 3x3 hard,
// and a positional heuristic for larger boards.
const AI = {
  chooseMove(board, size, winLength, difficulty, aiMark = "O", humanMark = "X") {
    const empty = board.map((v, i) => v === "" ? i : -1).filter(i => i >= 0);
    if (!empty.length) return -1;
    if (difficulty === "easy") return empty[Math.floor(Math.random() * empty.length)];
    if (size === 3 && winLength === 3 && difficulty === "hard") {
      return this.minimaxRoot(board.slice(), aiMark, humanMark);
    }
    if (difficulty === "medium") {
      const win = this.findImmediate(board, size, winLength, aiMark);
      if (win !== -1) return win;
      const block = this.findImmediate(board, size, winLength, humanMark);
      if (block !== -1) return block;
      return this.bestPosition(empty, size);
    }
    // Larger-board hard mode: win now, block immediate loss, then maximize open lines.
    const win = this.findImmediate(board, size, winLength, aiMark);
    if (win !== -1) return win;
    const block = this.findImmediate(board, size, winLength, humanMark);
    if (block !== -1) return block;
    let best = empty[0], bestScore = -Infinity;
    for (const move of empty) {
      board[move] = aiMark;
      const score = this.evaluatePosition(board, size, winLength, aiMark, humanMark, move);
      board[move] = "";
      if (score > bestScore) { bestScore = score; best = move; }
    }
    return best;
  },
  bestPosition(empty, size) {
    const center = (size - 1) / 2;
    return empty.reduce((best, idx) => {
      const r = Math.floor(idx / size), c = idx % size;
      const d = Math.abs(r - center) + Math.abs(c - center);
      const br = Math.floor(best / size), bc = best % size;
      return d < Math.abs(br-center) + Math.abs(bc-center) ? idx : best;
    }, empty[0]);
  },
  findImmediate(board, size, winLength, mark) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] !== "") continue;
      board[i] = mark;
      const won = GameLogic.hasWon(board, size, winLength, mark);
      board[i] = "";
      if (won) return i;
    }
    return -1;
  },
  evaluatePosition(board, size, winLength, ai, human, move) {
    let score = 0;
    const lines = GameLogic.getAllSegments(size, winLength);
    for (const line of lines) {
      if (!line.includes(move)) continue;
      const a = line.filter(i => board[i] === ai).length;
      const h = line.filter(i => board[i] === human).length;
      if (h === 0) score += Math.pow(4, a);
      if (a === 0) score -= Math.pow(4, h) * 1.15;
    }
    const row = Math.floor(move / size), col = move % size;
    const center = (size - 1) / 2;
    score -= (Math.abs(row-center) + Math.abs(col-center)) * 0.1;
    return score;
  },
  minimaxRoot(board, ai, human) {
    let bestScore = -Infinity, bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== "") continue;
      board[i] = ai;
      const score = this.minimax(board, 0, false, ai, human, -Infinity, Infinity);
      board[i] = "";
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
    return bestMove;
  },
  minimax(board, depth, maximizing, ai, human, alpha, beta) {
    if (GameLogic.hasWon(board, 3, 3, ai)) return 10 - depth;
    if (GameLogic.hasWon(board, 3, 3, human)) return depth - 10;
    if (board.every(Boolean)) return 0;
    if (maximizing) {
      let value = -Infinity;
      for (let i = 0; i < 9; i++) if (!board[i]) {
        board[i] = ai;
        value = Math.max(value, this.minimax(board, depth+1, false, ai, human, alpha, beta));
        board[i] = ""; alpha = Math.max(alpha, value); if (beta <= alpha) break;
      }
      return value;
    }
    let value = Infinity;
    for (let i = 0; i < 9; i++) if (!board[i]) {
      board[i] = human;
      value = Math.min(value, this.minimax(board, depth+1, true, ai, human, alpha, beta));
      board[i] = ""; beta = Math.min(beta, value); if (beta <= alpha) break;
    }
    return value;
  }
};
