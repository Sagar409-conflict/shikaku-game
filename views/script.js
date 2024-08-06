const socket = io();

const renderBoard = (boardState) => {
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${boardState[0].length}, 50px)`;

  boardState.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.dataset.row = rowIndex;
      cellDiv.dataset.col = colIndex;
      cellDiv.textContent = cell;
      cellDiv.addEventListener("click", handleCellClick);
      board.appendChild(cellDiv);
    });
  });
};

const handleCellClick = (event) => {
  const cell = event.target;
  const row = cell.dataset.row;
  const col = cell.dataset.col;
  console.log(`Cell clicked: Row ${row}, Col ${col}`);
  cell.classList.toggle("active");
};

socket.emit("initBoard", { width: 5, height: 5 }, (response) => {
  console.log("Board initialized:", response);
  renderBoard(response.boardState);
});
