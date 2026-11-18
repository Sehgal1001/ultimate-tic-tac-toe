// Connects the UI to the game engine and persistent statistics.
(() => {
  const $ = (id) => document.getElementById(id);
  const state = Storage.load();
  let selectedSize = 3, game, computerTimer = null;
  const board = $("gameBoard");

  function winLength(size) { return size===3?3:size===5?4:5; }
  function updateStats() {
    $("winsStat").textContent=state.wins; $("lossesStat").textContent=state.losses;
    $("drawsStat").textContent=state.draws; $("gamesStat").textContent=`${state.wins+state.losses+state.draws} GAMES`;
    $("historyList").innerHTML="";
    if(!state.history.length) { $("historyList").innerHTML='<p class="empty-history">Your completed matches will show up here.</p>'; return; }
    state.history.slice(0,5).forEach(item=>{
      const row=document.createElement("div"); row.className="history-item";
      const left=document.createElement("span"); left.textContent=`${item.size}×${item.size} · ${item.mode==="computer"?"vs Computer":"2 Players"}`;
      const right=document.createElement("span"); right.className="history-result"; right.textContent=item.result;
      const date=document.createElement("small"); date.textContent=item.date;
      row.append(left,right,date); $("historyList").append(row);
    });
  }
  function setStatus(text,icon="✦") { $("statusText").textContent=text; $("statusIcon").textContent=icon; }
  function render(g) {
    board.style.setProperty("--size",g.size); board.dataset.size=g.size;
    board.innerHTML="";
    g.board.forEach((mark,index)=>{
      const cell=document.createElement("button"); cell.type="button"; cell.className="cell";
      cell.setAttribute("aria-label",`Row ${Math.floor(index/g.size)+1}, column ${index%g.size+1}: ${mark||"empty"}`);
      if(mark) {
        const glyph=document.createElement("span");
        glyph.className="mark";
        glyph.textContent=mark==="X"?"×":"○";
        cell.append(glyph);
        cell.classList.add(mark==="X"?"mark-x":"mark-o");
      }
      if(g.winningCells.includes(index)) cell.classList.add("winning");
      if(index===g.lastMove) cell.classList.add("last-move");
      cell.disabled=!!mark||g.finished||(g.mode==="computer"&&g.current==="O");
      cell.addEventListener("click",()=>handleCell(index)); board.append(cell);
    });
    $("playerXCard").classList.toggle("active-player",g.current==="X"&&!g.finished);
    $("playerOCard").classList.toggle("active-player",g.current==="O"&&!g.finished);
    $("playerOName").textContent=g.mode==="computer"?"Computer":"Player 2";
    $("difficultyLabel").style.display=g.mode==="computer"?"block":"none";
    $("difficultySelect").style.display=g.mode==="computer"?"block":"none";
    $("undoBtn").disabled=!g.history.length||g.finished;
    $("gameTitle").textContent=g.size===3?"Classic Match":`${g.size} × ${g.size} Challenge`;
    $("rulesHint").textContent=`${g.size}×${g.size}: get ${g.winLength} in a row to win.`;
    $("howText").textContent=`Take turns placing X and O. Get ${g.winLength} in a row horizontally, vertically, or diagonally.`;
    if(g.finished) return;
    setStatus(g.mode==="computer"&&g.current==="O"?"Computer is thinking…":`${g.current==="X"?"Your":"Player 2's"} turn — make your move.`,g.current==="X"?"✦":"◉");
  }
  function finish(result) {
    clearTimeout(computerTimer);
    const mode=game.mode;
    let label;
    if(result==="draw") { state.draws++; label="Draw"; }
    else if(mode==="computer") { if(result==="X"){state.wins++;label="You won";}else{state.losses++;label="Computer won";} }
    else { label=result==="X"?"Player 1 won":"Player 2 won"; if(result==="X")state.wins++;else state.losses++; }
    state.history.unshift({size:game.size,mode,result:label,date:new Date().toLocaleDateString()});
    state.history=state.history.slice(0,20); Storage.save(state); updateStats();
    setStatus(result==="draw"?"It's a draw!":`${label}!`,result==="draw"?"◇":"✦");
    $("resultTitle").textContent=result==="draw"?"It's a draw!":mode==="computer"?(result==="X"?"You win!":"Computer wins"):(result==="X"?"Player 1 wins!":"Player 2 wins!");
    $("resultMessage").textContent=result==="draw"?"A close match. Try another round.":mode==="computer"?(result==="X"?"Great strategy. Ready for another?":"Good effort. Want a rematch?"):"Well played. Ready for a rematch?";
    $("resultModal").classList.remove("hidden");
  }
  function handleCell(index) {
    if(!game.play(index)) return;
    if(game.mode==="computer"&&!game.finished&&game.current==="O") {
      clearTimeout(computerTimer); computerTimer=setTimeout(()=>game.computerMove(),380);
    }
  }
  function startGame() {
    clearTimeout(computerTimer); $("resultModal").classList.add("hidden");
    const mode=$("modeSelect").value, difficulty=$("difficultySelect").value;
    game.start(selectedSize,mode,difficulty);
  }
  game=new TicTacToeGame(render,finish);
  $("boardChoices").addEventListener("click",e=>{
    const btn=e.target.closest("[data-size]"); if(!btn)return;
    selectedSize=Number(btn.dataset.size);
    document.querySelectorAll(".segment").forEach(b=>b.classList.toggle("active",b===btn));
    startGame();
  });
  $("modeSelect").addEventListener("change",startGame);
  $("difficultySelect").addEventListener("change",startGame);
  $("newGameBtn").addEventListener("click",startGame);
  $("undoBtn").addEventListener("click",()=>{clearTimeout(computerTimer);game.undo();});
  $("closeModalBtn").addEventListener("click",()=>$("resultModal").classList.add("hidden"));
  $("playAgainBtn").addEventListener("click",startGame);
  $("resultModal").addEventListener("click",e=>{if(e.target===$("resultModal"))$("resultModal").classList.add("hidden");});
  $("resetStatsBtn").addEventListener("click",()=>{
    if(!confirm("Reset all saved wins, losses, draws and match history?"))return;
    Object.assign(state,{wins:0,losses:0,draws:0,history:[]});Storage.save(state);updateStats();
  });
  updateStats(); render(game);
})();
