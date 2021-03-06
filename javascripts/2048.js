// from: http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array) {
    return false;
  }

  // compare lengths - can save a lot of time
  if (this.length != array.length) {
    return false;
  }

  for (var i = 0; i < this.length; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) {
        return false;
      }
    } else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;

}

$(document).ready(function() {
  console.log('ready!');
  prepareBoard();

  $('body').keydown(function(event){
    var arrow_keys = [37, 38, 39, 40];
    var direction = event.which;
    if(arrow_keys.indexOf(direction) > -1) {
      makeTurn(direction);
      event.preventDefault();
    }
  })

  $('.button.new-game').click(function() {
    location.reload();
  })
})

function prepareBoard() {
  addTile();
  addTile();
}


function tileSelectorText(row, col) {
  return ".tile[data-row=\"" + row + "\"][data-col=\"" + col + "\"]";
}

function collectEmptySpaces() {
  var emptySpaces = [];
  var row = null;
  var col = null;
  var tileLocation = null;
  // figure out all empty spots
  for (var i = 1; i < 5; i++) { // loop through rows
    row = i;
    for (var j = 1; j < 5; j++) { // loop through cols
      col = j;
      tileLocation = $(tileSelectorText(row, col));
      if (tileLocation.length == 0) {
        emptySpaces.push([row, col]);
      }
    }
  }
  return emptySpaces;
}

function addTile() {
  var tile = $("<div data-row='' data-col='' data-val=''></div>");
  var dataVal = Math.random() < 0.04 ? 4 : 2;
  var emptySpaces = collectEmptySpaces(); // guard for if no empty spaces?

  // function to pick row and column number
  var randomLocation = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];

  tile.addClass("tile");
  tile.attr("data-row", randomLocation[0]);
  tile.attr("data-col", randomLocation[1]);
  tile.attr("data-val", dataVal);
  tile.text(dataVal);
  tile.addClass("new");

  $("#gameboard").append(tile);
  // remove new class after animation is complete
  tile.on("animationend", function() {
    tile.removeClass("new");
  })
}

function makeTurn(direction) {
  var tiles = $(".tile"); // in order by the html
  var turnType = rowOrColumn(direction);
  var turnOppositeType = (turnType == "data-row") ? "data-col" : "data-row";
  // set the positive or negative magnitude according to direction
  var turnMagnitude = parseInt(getMagnitude(direction));
  var score = parseInt($("#score").attr("data-score"));

  // take snapshot of board at start of turn
  var startingGameboard = gameboardSnapshot($(".tile"));

  function gameboardSnapshot(tiles) {
    var gameboard = [];
    for (var i = 0; i < tiles.length; i++) {
      var dataRow = tiles[i].getAttribute("data-row");
      var dataCol = tiles[i].getAttribute("data-col");
      var dataVal = tiles[i].getAttribute("data-val");
      var tileProperties = new Array(dataRow, dataCol, dataVal);
      gameboard[i] = tileProperties;
    }
    return gameboard;
  }

  function validMove() {
    var validity = true;
    var currentGameboard = gameboardSnapshot($(".tile"));

    if (startingGameboard.equals(currentGameboard)) {
      validity = false;
    }
    console.log("validity: " + validity);
    return validity;
  }

  var updateScore = function(points) {
    score += points;
    var scoreBoard = $("#score");
    scoreBoard.attr("data-score", score);
    scoreBoard.text(score);
  }

  function moveTiles() {
    var moveInDirection = makeMovement(direction);

    // order tiles correctly
    var sortedTiles = orderTiles();

    for (var i = 0; i < sortedTiles.length; i++) {
      moveInDirection(sortedTiles[i]);
    }
  }

  function orderTiles() {
    // check if movement is up/down (row) or right/left (col)
    // check if movement makes values get smaller (up/left) or bigger (down/right)
    var magnitude = parseInt(getMagnitude(direction));
    // store type of non-movement dimension

    // split into groups by type
    var typeA = [];
    var typeB = [];
    var typeC = [];
    var typeD = [];

    var upLeftOrder = [1, 2, 3, 4];
    var downRightOrder = [4, 3, 2, 1];

    var order = (direction == 38 || direction == 37) ? upLeftOrder : downRightOrder;

    for (var i = 0; i < tiles.length; i++) {
      if (tiles[i].getAttribute(turnType) == order[0]) {
        typeA.push(tiles[i]);
      } else if (tiles[i].getAttribute(turnType) == order[1]) {
        typeB.push(tiles[i]);
      } else if (tiles[i].getAttribute(turnType) == order[2]) {
        typeC.push(tiles[i]);
      } else if (tiles[i].getAttribute(turnType) == order[3]) {
        typeD.push(tiles[i]);
      }
    }

    var allTypes = [typeA, typeB, typeC, typeD];
    // sort each group
    for (var i = 0; i < allTypes.length; i++) {
      allTypes[i].sort(function(a, b) {
        var oppositeValueA = parseInt(a.getAttribute(turnOppositeType));
        var oppositeValueB = parseInt(b.getAttribute(turnOppositeType));
        return (magnitude == 1) ? oppositeValueA < oppositeValueB : oppositeValueA > oppositeValueB;
      })
    }
    // join each sorted group
    var sortedTiles = [];
    sortedTiles = sortedTiles.concat.apply(sortedTiles, allTypes);

    return sortedTiles;
  }

  function findMergeableTile(tile, type, magnitude) {
    // this gets the value of the tile passed in
    var dataVal = tile.getAttribute("data-val");
    // this gets the value of the type (row for up/down, col for right/left)
    var typeValue = tile.getAttribute(type);
    // this gets the value of the opposite type (col for up/down, row for R/L)
    var oppositeType = (type == "data-row") ? "data-col" : "data-row";
    var oppositeValue = tile.getAttribute(oppositeType);
    // find neighbor value ( if c1,r1 and moving up, neighbor is c1, r2)
    var neighborValue = parseInt(typeValue) - magnitude;
    // nasty block text stuff
    var neighborText = ".tile[" + type + "=\"" + neighborValue + "\"][" + oppositeType + "=\"" + oppositeValue + "\"]";
    // use block text to check if neighbor exists
    var neighbor = $(neighborText);

    if (neighbor.length > 0) {
      neighbor = neighbor[0];
      if (neighbor.getAttribute("data-val") == dataVal) {
        return neighbor;
      }
    } else {
      return null;
    }
  }

  function mergeTiles() {
    var sortedTiles = orderTiles();

    for (var i = 0; i < sortedTiles.length; i++) {
      var neighbor = findMergeableTile(sortedTiles[i], turnType, turnMagnitude);
      // if neighbor exists, then double current tile's value and delete neighbor tile
      if (neighbor) {
        var currentVal = parseInt(sortedTiles[i].getAttribute("data-val"));
        var newVal = currentVal * 2;

        // setting neighbor tile's to the original tile's position for animation
        neighbor.className = neighbor.className + " merged";
        neighbor.setAttribute("data-row", sortedTiles[i].getAttribute("data-row"));
        neighbor.setAttribute("data-col", sortedTiles[i].getAttribute("data-col"));

        sortedTiles[i].setAttribute("data-val", (newVal));
        updateScore(newVal);
        sortedTiles[i].innerHTML = (newVal);
        // add animation to sortedtile[i] here
        sortedTiles[i].className = sortedTiles[i].className + " blowup";
        var mergedTile = $(".tile.blowup");
        mergedTile.on("animationend", function(){
            mergedTile.removeClass("blowup");
        });

        var neighborIndex = sortedTiles.indexOf(neighbor);
        // so sorry
        sortedTiles = sortedTiles.splice(0,neighborIndex).concat(
           sortedTiles.splice(1, sortedTiles.length-1)
           );
        checkWin(newVal);

      }

      // try adding document.addEventListener("transitionend", function(){})
      // look for delegation syntax
      // --> in jquery, to make the transition end more deliberate
      // animation to hide the merged tile, then delete it
      $(".tile.merged").remove();
      // $(".tile.merged").on("transitionend", function() {
        // $(this).hide("fast", function(){
      //   $(this).remove();
      //   // });
      // });
    }
  }

  function rowOrColumn(direction) {
    var type = "";
    if (direction == 38 || direction == 40) {
      type = "data-row";
    } else if (direction == 37 || direction == 39) {
      type = "data-col";
    }

    return type;
  }

  function getMagnitude(direction) {
    var value = "";
    // if moving left or up
    if (direction == 37 || direction == 38) {
      value = "-1";
    // if moving down or right
    } else if (direction == 39 || direction == 40) {
      value = "1";
    }

    return value;
  }

  // outputs a function that takes a tile and moves it in a particular direction
  function makeMovement() {
    var moveTile = function(tile) {

      function okayToMove(tile) {
        var okay = true;
        var oppositeValue = tile.getAttribute(turnOppositeType);
        var blockerText = ".tile[" + turnType + "=\"" + newAttributeValue + "\"][" + turnOppositeType + "=\"" + oppositeValue + "\"]";
        var blocker = $(blockerText);

        if (blocker.length > 0) {
          okay = false;
        }

        return okay;
      }

      // move the tile one space
      var relevantAttributeValue = tile.getAttribute(turnType);
      // console.log(relevantAttributeValue);
      var newAttributeValue = parseInt(relevantAttributeValue) + turnMagnitude;

      // if already on the furthest edge, do not reassign value
      if (newAttributeValue > 4) {
        newAttributeValue = 4;
      } else if (newAttributeValue < 1) {
        newAttributeValue = 1;
      }

      if (okayToMove(tile)) {
        tile.setAttribute(turnType, newAttributeValue);
        moveTile(tile);
      }
      // if tile can't move, do nothing
    }
    return moveTile;
  }

  function checkWin(score) {
    var winningScore = 2048;
    if (score == winningScore) {
      $("#gameboard").addClass("game-over");
      gameOverBox("You won!", "continue-play", "Keep playing");

      $('.button.continue-play').click(function() {
        $("#game-over-box").remove();
        $("#gameboard").removeClass("game-over");
      })
    }
  }

  // adds a div on top of the gameboard, notifying player of win or loss
  // and allows player to keep playing (if won) or start a new game (if loss)
  function gameOverBox(message, buttonClass, buttonText) {
    var gameOverBox = $("<div id='game-over-box'></div>");
    var gameOverMessage = $("<h2 id='game-over-message'></h2>");
    gameOverMessage.text(message);
    gameOverBox.append(gameOverMessage);
    $("#gameboard-container").append(gameOverBox);
    var button = $("<div class='" + buttonClass + " button'></div>");
    button.append("<p>"+ buttonText + "</p>");
    gameOverBox.append(button);
  }

  function gameLoss() {
    $("#gameboard").addClass("game-over") ;
    gameOverBox("Game Over!", "new-game", "Try again");
  }

  function checkLoss() {
    // count empty spaces, if 0 continue
    var emptySpaces = collectEmptySpaces();
    var lost = true;
    if (emptySpaces.length == 0) {
      // for every tile
      // check merge in every direction
      var tiles = $(".tile");
      for (var i = 0; i < tiles.length; i++) { // loop through each tile
        if (lost == false) {
          break;
        } else {
          for (var j = 0; j < 4; j++) { // loop through each direction
            var directions = [38, 40, 37, 39];
            var direction = directions[j];
            var type = rowOrColumn(direction);
            var magnitude = getMagnitude(direction);
            var mergeableTile = findMergeableTile(tiles[i], type, magnitude);
            // if no mergeable tile, returns null
            // if trying to check on edge, returns undefined
            if (mergeableTile) {
              // stop checking
              lost = false;
              break;
            }
          }
        }
      }

      if (lost == true) {
        gameLoss();
      }
    }

    $('.button.new-game').click(function() {
      location.reload();
    })
  }

  moveTiles();
  mergeTiles(); // scoring happens here
  if (validMove()) {
    moveTiles();
    addTile();
    checkLoss();
  }
}
