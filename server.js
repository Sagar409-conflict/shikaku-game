const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect("mongodb://127.0.0.1:27017/shikaku", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const gameSchema = new mongoose.Schema({
  boardId: String,
  boardState: Array,
  rectangles: Array,
  startTime: Date,
  endTime: Date,
});

const Game = mongoose.model("Game", gameSchema);

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) => {
  res.render("index");
});
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Initialize Puzzle Board
  socket.on("initBoard", async (data, callback) => {
    const boardId = new mongoose.Types.ObjectId().toString();
    const boardState = createInitialBoard(data.width, data.height);
    const game = new Game({
      boardId,
      boardState,
      rectangles: [],
      startTime: new Date(),
    });
    await game.save();
    callback({ boardId, boardState });
  });

  // Generate Rectangles on the Board
  socket.on("generateRectangles", async (data, callback) => {
    const game = await Game.findOne({ boardId: data.boardId });
    if (!game) return callback({ error: "Board not found" });

    const rectangles = generateRectangles(data.width, data.height);
    game.rectangles = rectangles;
    await game.save();
    callback({ rectangles });
  });

  // Handle Player Input
  socket.on("selectRectangle", async (data, callback) => {
    const game = await Game.findOne({ boardId: data.boardId });
    if (!game) return callback({ error: "Board not found" });

    const rectangle = game.rectangles.find(
      (rect) => rect.id === data.rectangleId
    );
    callback({ rectangle });
  });

  // Snap and Lock Rectangles
  socket.on("snapRectangle", async (data, callback) => {
    const game = await Game.findOne({ boardId: data.boardId });
    if (!game) return callback({ error: "Board not found" });

    // Implement snapping logic here
    const { rectangleId, x, y } = data;
    const rectangle = game.rectangles.find((rect) => rect.id === rectangleId);
    rectangle.x = x;
    rectangle.y = y;
    await game.save();
    callback({ rectangle });
  });

  // Check Win Condition
  socket.on("checkWin", async (data, callback) => {
    const game = await Game.findOne({ boardId: data.boardId });
    if (!game) return callback({ error: "Board not found" });

    const isWin = checkWinCondition(game.boardState, game.rectangles);
    if (isWin) {
      game.endTime = new Date();
      await game.save();
      callback({ message: "You win!" });
    } else {
      callback({ message: "Keep trying" });
    }
  });

  // Reset the Game
  socket.on("resetGame", async (data, callback) => {
    const boardState = createInitialBoard(data.width, data.height);
    const rectangles = generateRectangles(data.width, data.height);
    const game = new Game({
      boardId: data.boardId,
      boardState,
      rectangles,
      startTime: new Date(),
    });
    await game.save();
    callback({ boardState, rectangles });
  });

  // Track Time
  socket.on("trackTime", async (data, callback) => {
    const game = await Game.findOne({ boardId: data.boardId });
    if (!game) return callback({ error: "Board not found" });

    const elapsedTime = (new Date() - game.startTime) / 1000;
    callback({ elapsedTime });
  });
});

const createInitialBoard = (width, height) => {
  const board = Array.from({ length: height }, () => Array(width).fill(0));
  return board;
};

const generateRectangles = (width, height) => {
  const rectangles = [];
  const maxRectangles = Math.floor((width * height) / 4); // Arbitrary number to limit rectangles
  let idCounter = 1;

  console.log("🚀 ~ isOverlapping ~ x:", x);
  console.log("🚀 ~ isOverlapping ~ y:", y);
  console.log("🚀 ~ isOverlapping ~ rectWidth:", rectWidth);
  console.log("🚀 ~ isOverlapping ~ rectHeight:", rectHeight);
  const isOverlapping = (x, y, rectWidth, rectHeight) => {
    return rectangles.some(
      (rect) =>
        x < rect.x + rect.width &&
        x + rectWidth > rect.x &&
        y < rect.y + rect.height &&
        y + rectHeight > rect.y
    );
  };

  for (let i = 0; i < maxRectangles; i++) {
    let placed = false;
    while (!placed) {
      const rectWidth = Math.floor(Math.random() * 3) + 1; // Random width between 1 and 3
      const rectHeight = Math.floor(Math.random() * 3) + 1; // Random height between 1 and 3
      const x = Math.floor(Math.random() * (width - rectWidth + 1));
      const y = Math.floor(Math.random() * (height - rectHeight + 1));

      if (!isOverlapping(x, y, rectWidth, rectHeight)) {
        console.log("Line 161");
        rectangles.push({
          id: idCounter++,
          width: rectWidth,
          height: rectHeight,
          x,
          y,
        });
        placed = true;
      } else {
        console.log("Line 170");
      }
    }
  }

  return rectangles;
};

const checkWinCondition = (boardState, rectangles) => {
  // Implement win condition checking logic here
};
