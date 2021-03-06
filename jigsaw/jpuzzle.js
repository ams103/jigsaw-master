/*
   
   Global Variables List;

   grids
      An array of elements belonging to the grid class

   pieces
      An array of elements belonging to the pieces class

   mousePiece
      The puzzle piece currently selected by the user's mouse
   
   keyPiece
      The puzzle piece currently selected by the user's keyboard

   keyIndex
      The index number of keyPiece

   selectMode
      A Boolean value where true = keyboard use is in Select Piece mode,
      false = keyboard use is in Move Piece mode

   diffX
      The horizontal distance in pixels between the left edge of
      mousePiece and the mouse pointer

   diffX
      The vertical distance in pixels between the top edge of
      mousePiece and the mouse pointer

   maxZ
      An integer representing the highest z-index value on the Web page

   hoverGrid
      The grid square that the moving puzzle piece is currently hovered over


   
   Functions List:

   jumbleIt()
      Reloads the current Web page, thus re-arranging the puzzle

   solveIt()
      Places the puzzle images in the current order as background images
      for the grid squares

   init()
      Sets up and initializes the Web page, defining the grid and pieces array,
      and appying event handlers to mouse and keyboard actions


   keyMove(moveX, moveY)
      Moves the keyPiece moveX pixels to the right and moveY pixels down.

   selectPiece(diffIndex)
      Changes the index of the selected keyPiece by a value of diffIndex sets the
      format of the new keyPiece

   toggleMode()
      Switches the Web page between Select Piece mode and Move Piece mode. Drops the
      currently moving keyPiece onto the Web page, aligning it with the grid

   dropValid(object)
      Returns a Boolean value indicating whether it valid to drop the object. The function
      is false if dropping object will cover a puzzle piece and true if otherwise

   alignPiece(object)
      If object is over a grid square, aligns object with the top-left corner of the square

   highlightGrid(object)
      If object is over a grid square, sets the background color of the square to light green

   mouseGrab(e)
      "Grabs" a puzzle piece using the mousedown action. Sets the value of mousePiece. Calculates
      the value of diffX and diffY. Applies event handlers for mousemove and mouseup events

   mouseMove(e)
      Move mousePiece across the Web page, keeping a constant distance from the mouse pointer

   mouseDrop(e)
      Drops mousePiece on the Web page (if it is not over another puzzle piece). Aligns the
      piece with the grid. Turns off event handlers for the mousemove and mouseup events.

*/

$(document).ready(function(){

    var grids = new Array(); //An array of elements belonging to the grid class
    var pieces = new Array(); //An array of elements belonging to the pieces class
    var movingPieces = new Array(); //An array to store moving elements
    var stoppedPieces = new Array();
    var mousePiece = null; //The puzzle piece currently selected by the user's mouse

    var allElem = document.getElementsByTagName("*");

    for (var i = 0; i < allElem.length; i++) {
        if (allElem[i].className == "pieces") movingPieces.push(allElem[i]);
    }

    var  keyPiece  =  null; //The puzzle piece currently selected by the user's keyboard
    var  keyIndex  =  null; //The index number of keyPiece
    var  selectMode  =  true; //A Boolean value where true = keyboard use is in Select Piece mode, false = keyboard use is in Move Piece mode

    /* diffX The horizontal distance in pixels between the left edge of
          mousePiece and the mouse pointer */
    var  diffX  =  null;
    /* diffY
          The vertical distance in pixels between the top edge of
          mousePiece and the mouse pointer
    */
    var  diffY  =  null;

    var maxZ = 1; // An integer representing the highest z-index value on the Web page
    var hoverGrid = null;
    window.onload = init;




    /* S , ets up and initializes the Web page, defining the grid and pieces array,
          and applying event handlers to mouse and keyboard actions
    */
    function init() {

       var allElem = document.getElementsByTagName("*");

       for (var i = 0; i < allElem.length; i++) {
          if (allElem[i].className == "grid") grids.push(allElem[i]);
          if (allElem[i].className == "pieces") pieces.push(allElem[i]);
       }

       var randomIntegers = randomArray(pieces.length);

       for(i = 0; i < pieces.length; i++) {
          pieces[i].style.backgroundImage = "url(images/dk" + randomIntegers[i] + ".jpg)";
          pieces[i].style.top  =  getStyle(pieces[i],"top");
          pieces[i].style.left  =  getStyle(pieces[i],"left");
          pieces[i].style.width  =  getStyle(pieces[i],"width");
          pieces[i].style.height  =  getStyle(pieces[i],"height");

          pieces[i].style.cursor = "pointer";

          addEvent(pieces[i], "mousedown", mouseGrab, false);
       }

       for  (var  i  =  0;  i  <  grids.length;  i++)  {
          grids[i].style.top  =  getStyle(grids[i],"top");
          grids[i].style.left  =  getStyle(grids[i],"left");
          grids[i].style.width  =  getStyle(grids[i],"width");
          grids[i].style.height  =  getStyle(grids[i],"height");
    }
       document.onkeydown  =  keyGrab;
       keyPiece  =  pieces[0];
       keyIndex  =  0;

       //Must instantiate pieces before calling animateDiv().
       animateDiv();
    }


    function  keyGrab(e)  {
       var  evt  =  e  ||  window.event;
       if  (evt.keyCode  ==  32)  {toggleMode(); return false}


    }




    /* dropValid(object)
          Returns a Boolean value indicating whether it valid to drop the object. The function
          is false if dropping object will cover a puzzle piece and true if otherwise
    */
    function dropValid(object) {
       for (var i = 0; i < pieces.length; i++) {
          if (withinIt(object, pieces[i])) return false;
       }
       return true;
    }

    /* alignPiece(object)
          If object is over a grid square, aligns object with the top-left corner of the square
    */

    function solveCheck() {
        var count = 0;

        for(var i = 0; i < pieces.length; i++) {
            //1. Get image ID
            var imagePiece = pieces[i];
            var image = pieces[i].style.backgroundImage;
            var imageID = null;
            if(image.length == 22) {
                imageID = image.slice(14, 16);
                //console.log(imageID);
            }else {
                imageID = image.slice(14, 15);
                //console.log(imageID);
            }

            //2. Test imageID against all grid ID's
            for(var j = 0; j < grids.length; j++) {
                //3. Get grid ID
                var gridPiece = grids[j];
                var grid = grids[j].id;
                var gridID = grid.slice(4);

                if(imageID == gridID) {
                    //4. Check if image left and top equals grid left and top

                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", 'http://localhost:8081/puzzle?puzzleComplete=1', true);
                    xhr.onreadystatechange = function(){
                        if(this.readyState == 4) {
                            var data = xhr.responseText;//JSON.parse( xhr.responseText);

                            document.getElementById("test").innerHTML = data
                        }
                        else
                            console.log("darn")
                    }
                    xhr.send();
                            //Sends completion to the server
                        }
                    }
                }
            }
        }
    }

    function alignPiece(object) {
       for (var i = 0; i < grids.length; i++) {
          if(withinIt(object, grids[i])) {
             object.style.left = grids[i].style.left;
             object.style.top = grids[i].style.top;
             break;
          }
       }
    }

    /*highlightGrid(object)
          If object is over a grid square, sets the background color of the square to light green
    */
    function highlightGrid(object) {
       if(hoverGrid) hoverGrid.style.backgroundColor = "";

       for (var i = 0; i < grids.length; i++) {
       if (withinIt(object, grids[i])) {
          hoverGrid = grids[i];
          hoverGrid.style.backgroundColor = "rgb(75, 88, 98)";
          break;
       }
    }
    }

    /* mouseGrab(e)
          "Grabs" a puzzle piece using the mousedown action. Sets the value of mousePiece. Calculates
          the value of diffX and diffY. Applies event handlers for mousemove and mouseup events
    */
    function mouseGrab(e) {
        console.log("mouseGrab");
       var evt = e|| window.event;
       mousePiece = evt.target || evt.srcElement;
       maxZ ++;

       //Remove piece from array and stop animation
        $(mousePiece).stop();
        var index = movingPieces.indexOf(mousePiece);
        movingPieces.splice(index, 1);
        console.log(movingPieces);
        $(mousePiece).stop();

        //Loop through an array with all removed pieces and assign a stop() to them
        // I think the updating of the animate array is a bit slow so it doesn't always apply when you click the piece
        stoppedPieces.push(mousePiece);

       mousePiece.style.zIndex = maxZ; // Place the piece above other objects

       mousePiece.style.cursor = "move";

       var  mouseX  =  evt.clientX;  //  x-coordinate  of  pointer
       var  mouseY  =  evt.clientY;  //  y-coordinate  of  pointer

       /*  Calculate  the  distance  from  the  pointer  to  the  piece  */
       diffX  =  parseInt(mousePiece.style.left)  -  mouseX;
       diffY  =  parseInt(mousePiece.style.top)  -  mouseY;

       /*  Add  event  handlers  for  mousemove  and  mouseup  events  */
       addEvent(document,  "mousemove",  mouseMove,  false);
       addEvent(document,  "mouseup",  mouseDrop,  false);
    }

    /* mouseMove(e)
          Move mousePiece across the Web page, keeping a constant distance from the mouse pointer
    */
    function  mouseMove(e)  {
       var  evt  =  e  ||  window.event;

       var  mouseX  =  evt.clientX;
       var  mouseY  =  evt.clientY;
       $(mousePiece).stop();
       mousePiece.style.left  =  mouseX  +  diffX  +  "px";
       mousePiece.style.top  =  mouseY  +  diffY  +  "px";
       highlightGrid(mousePiece);
    }

    /* mouseDrop(e)
          Drops mousePiece on the Web page (if it is not over another puzzle piece). Aligns the
          piece with the grid. Turns off event handlers for the mousemove and mouseup events.
    */
    function  mouseDrop(e)  {

       if(dropValid(mousePiece)) {

          alignPiece(mousePiece);

          removeEvent(document,  "mousemove",  mouseMove,  false);
          removeEvent(document,  "mouseup",  mouseDrop,  false);
          mousePiece.style.cursor = "pointer";
          solveCheck()
       }
    }

    /*makeNewPosition()
            Retrieve window width and height
            then set a new width and height randomly and reutrn that
     */
    function makeNewPosition(){

        // Get viewport dimensions (remove the dimension of the div (50x50))
        var h = $(window).height() - 450;
        var w = $(window).width() - 250;

        var nh = Math.floor(Math.random() * h);
        var nw = Math.floor(Math.random() * w);

        return [nh,nw];

    }

    /*animateDiv()
            set new position from makeNewPosition
            set old position equal to the coordinates of the element relative to the document
     */
    function animateDiv(){
        //Loop through each piece and assign a random new position
            for(var i = 0; i < movingPieces.length; i++) {
                //var currentPiece = movingPieces[i];
                /*
                 For each piece we grab, compare it's position to all grid positions
                 if it's on a grid then stop the animation and slice it from the array to
                 stop further animations to run
                 */

                /*
                for(var j = 0; j < grids.length; j++){
                    if(currentPiece.style.left == grids[j].style.left && currentPiece.style.top == grids[j].style.top) {
                        var index = movingPieces.indexOf(currentPiece);
                        //movingPieces.splice(index, index+1);
                        //stoppedPieces.push(element);
                        console.log(movingPieces);
                        console.log(index);
                        console.log("That's true!");
                        //$(currentPiece).stop();
                    }
                }
                */

                var newq = makeNewPosition();
                var oldq = $(movingPieces[i]).offset();
                var speed = calcSpeed([oldq.top, oldq.left], newq);

                //Loop through all pieces and animate them
                $(movingPieces[i]).animate({ top: newq[0], left: newq[1] }, speed, function(){
                    animateDiv();
                });
            }
    };

    /*calcSpeed(prevv, next)
            calculate speed based on old and new position
     */
    function calcSpeed(prev, next) {

        var x = Math.abs(prev[1] - next[1]);
        var y = Math.abs(prev[0] - next[0]);

        var greatest = x > y ? x : y;

        var speedModifier = 0.20;

        var speed = Math.ceil(greatest/speedModifier);

        //Keep speed at a constant
        if(speed < 3000 || speed > 3000) {
            speed = 3000;
            return speed;
        }
        return speed;

    }
});

