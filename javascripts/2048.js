$(document).ready(function() {
  console.log('ready!');
  $('body').keydown(function(event){
    var arrow_keys = [37, 38, 39, 40];
    var direction = event.which;
    if(arrow_keys.indexOf(direction) > -1) {
      moveTiles(direction);
      event.preventDefault();
    }
  })
})

function moveTiles(direction) {
  var tiles = $(".tile");
  for (i = 0; i < tiles.length; i++) {
    moveTile(tiles[i], direction);
  }

}

function moveTile(tile, direction) {
  var farthestEdgeType = "";
  var farthestEdgeValue = "";

  switch(direction) {
    case 38: // up
      farthestEdgeType = "data-row";
      farthestEdgeValue = "r0";
      break;
    case 40: // down
      farthestEdgeType = "data-row";
      farthestEdgeValue = "r3";
      break;
    case 37: // left
      farthestEdgeType = "data-col";
      farthestEdgeValue = "c0";
      break;
    case 39: // right
      farthestEdgeType = "data-col";
      farthestEdgeValue = "c3";
      break;
  }

  tile.setAttribute(farthestEdgeType, farthestEdgeValue);
}

// function moveTile(tile, direction) {
//   var new_tile_value = tile.attr("data-val") * 2;
//   tile.attr("data-val", new_tile_value);
//   tile.text(new_tile_value);

//   switch(direction) {
//     case 38: //up
//       tile.attr("data-row","r0");
//       break;
//     case 40: //down
//       tile.attr("data-row","r3");
//       break;
//     case 37: //left
//       tile.attr("data-col","c0");
//       break;
//     case 39: //right
//       tile.attr("data-col","c3");
//       break;
//   }
// }
