$(document).ready(function() {
  console.log('ready!');
  $('body').keydown(function(event){
    var arrow_keys = [37, 38, 39, 40];
    var direction = event.which;
    if(arrow_keys.indexOf(direction) > -1) {
      moveTiles(direction);
      // moveTile(tile, event.which);
      event.preventDefault();
    }
  })
})

function moveTiles(direction) {
  // find set of tiles that might move, loop through
  var farthestEdgeType = "";
  var farthestEdgeValue = "";

  switch(direction) {
    case 38: // up
      farthestEdgeType = "data-row";
      farthestEdgeValue = "r0";
    case 40: // down
      farthestEdgeType = "data-row";
      farthestEdgeValue = "r3";
    case 37: // left
      farthestEdgeType = "data-col";
      farthestEdgeValue = "c0";
    case 39: // right
      farthestEdgeType = "data-col";
      farthestEdgeValue = "c3";
  }

  var allTiles = $('.tile');
  var movableTiles = [];

  for (var i = 0; i < allTiles.length; i++) {
    if (allTiles[i].attr(farthestEdgeType) != farthestEdgeValue ) {
      movableTiles.push(allTiles[i]);
    }
  }


}

function moveTile(tile, direction) {
  var new_tile_value = tile.attr("data-val") * 2;
  tile.attr("data-val", new_tile_value);
  tile.text(new_tile_value);

  switch(direction) {
    case 38: //up
      tile.attr("data-row","1");
      break;
    case 40: //down
      tile.attr("data-row","4");
      break;
    case 37: //left
      tile.attr("data-col","1");
      break;
    case 39: //right
      tile.attr("data-col","4");
      break;
  }
}
