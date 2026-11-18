// Core game rules, board state, turns and undo.
const GameLogic = {
  getAllSegments(size, winLength) {
    const lines = [];
    for (let r=0;r<size;r++) for(let c=0;c<size;c++) {
      const directions = [[0,1],[1,0],[1,1],[1,-1]];
      for (const [dr,dc] of directions) {
        const er=r+(winLength-1)*dr, ec=c+(winLength-1)*dc;
        if(er<0||er>=size||ec<0||ec>=size) continue;
        const segment=[];
        for(let k=0;k<winLength;k++) segment.push((r+k*dr)*size+(c+k*dc));
        lines.push(segment);
      }
    }
    return lines;
  },
  hasWon(board,size,winLength,mark) {
    return this.getAllSegments(size,winLength).some(line=>line.every(i=>board[i]===mark));
  },
  winningLine(board,size,winLength,mark) {
    return this.getAllSegments(size,winLength).find(line=>line.every(i=>board[i]===mark)) || [];
  }
};

class TicTacToeGame {
  constructor(onUpdate, onFinish) {
    this.onUpdate=onUpdate; this.onFinish=onFinish;
    this.start(3,"computer","medium");
  }
  start(size,mode,difficulty) {
    this.size=size; this.winLength=size===3?3:size===5?4:5;
    this.mode=mode; this.difficulty=difficulty; this.board=Array(size*size).fill("");
    this.current="X"; this.finished=false; this.history=[]; this.winningCells=[];
    this.lastMove=-1; this.onUpdate(this);
  }
  play(index) {
    if(this.finished||this.board[index]|| (this.mode==="computer"&&this.current==="O")) return false;
    this.makeMove(index); return true;
  }
  makeMove(index) {
    this.history.push({board:this.board.slice(),current:this.current,lastMove:this.lastMove});
    this.board[index]=this.current; this.lastMove=index;
    if(GameLogic.hasWon(this.board,this.size,this.winLength,this.current)) {
      this.finished=true; this.winningCells=GameLogic.winningLine(this.board,this.size,this.winLength,this.current);
      this.onUpdate(this); this.onFinish(this.current); return;
    }
    if(this.board.every(Boolean)) {
      this.finished=true; this.onUpdate(this); this.onFinish("draw"); return;
    }
    this.current=this.current==="X"?"O":"X"; this.onUpdate(this);
  }
  computerMove() {
    if(this.finished||this.mode!=="computer"||this.current!=="O") return;
    const index=AI.chooseMove(this.board,this.size,this.winLength,this.difficulty,"O","X");
    if(index>=0) this.makeMove(index);
  }
  undo() {
    if(!this.history.length||this.finished) return;
    // In computer mode undo the computer move and the preceding human move together.
    let steps=this.mode==="computer"&&this.current==="X"?2:1;
    while(steps-->0&&this.history.length) {
      const previous=this.history.pop();
      this.board=previous.board; this.current=previous.current; this.lastMove=previous.lastMove;
    }
    this.winningCells=[]; this.onUpdate(this);
  }
}
