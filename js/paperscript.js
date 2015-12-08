// Global variable declarations
var Nodes, Lines, radius, stroke, connectLines, secondCounter, adder, globDragPoint, text, mouseDownholder;
Nodes = [];
Lines = [];
radius = 55;
stroke = 15;
mouseDownHolder = null;





///  Styles 
// Line style
var lineStyle = {
		strokeWidth: stroke,
		fillColor: '#446CB3',
		strokeColor: '#E4F1FE',
		strokeCap: 'round'
	}
	// Node style
var nodeStyle = lineStyle;
// nodeStyle.strokeWidth = 10;

// Style for highlighted node
var highlightStyle = {
	fillColor: '#59ABE3'
}


//////////// Object constructors ////////////

/// Node object constructor
function Node(pos, nodeID) {

	// Assigns random position if none specified
	this.nextPoint = pos ? pos : randPoint(radius, Nodes);

	// Creates the Path
	this.node = new Path.Circle(this.nextPoint, radius);
	this.node.style = nodeStyle;

	// initialises nextPoint to current position
	this.nextPoint = this.node.position;

	this.nodeID = nodeID; // Needs to be assigned
	this.selected = false;
	this.lines = []; // Where all connecting lines will be referenced

	// this.textLabel = new PointText({
	//   position: new Point(this.nextPoint),
	//   content: nodeID,
	//   fillColor: 'white',
	//   fontFamily: 'Calibri',
	//   fontSize: 25
	// });

	// this.textLabel.point = this.nextPoint;


	this.move = function() {
		// this.textLabel.position = this.nextPoint;
		// this.textLabel.bringToFront();
		if (this.dragging) {
			this.node.position = this.nextPoint;
		}
	}

	// Drag and drop capabilities 
	this.dragging = false;
	this.linking = false;

	this.del = function() {
		for (var i = 0; i < this.lines.length; i++) {
			this.lines[i].line.remove();
		}

		for (var i = 0; i < Nodes.length; i++) {
			if (Nodes[i].selected === true) {
				Nodes[i].node.remove();
				Nodes.splice(i, 1);
			}
		}
	}

	var dragPoint;
	this.node.onMouseDown = function(event) {
		mouseDownHolder = this; // Assigns this Node object to the holder
		this.node.bringToFront();
		if (event.point.isClose(this.node.position, radius - stroke / 2)) {
			this.dragging = true;
			this.node.style = highlightStyle;
			dragPoint = this.nextPoint - event.point;

			// console.log("Is close!");
		} else {
			// console.log(Lines);
			Lines[Lines.length] = new Line(this, Nodes[randInt(Nodes.length - 1)]);
			// console.log("Is NOT close!");
		}
	}.bind(this);

	this.node.onMouseDrag = function(event) {
		if (this.dragging) {
			this.nextPoint = dragPoint + event.point;
		}
	}.bind(this);

	this.mouseUpEvent = function(event) {
		this.nextPoint = dragPoint + event.point;
		this.node.style = nodeStyle;
		this.dragging = false;

		mouseDownHolder = null; // Clear the global variable from this
	}.bind(this);

	// Node delete
	this.node.onDoubleClick = function(event) {
		this.selected = true;
		this.del();
	}.bind(this);
}





/////////////////////////
// Line constructor! 
function Line(p1, p2) {
	this.nodes = [p1, p2];
	p1.lines.push(this);
	p2.lines.push(this);

	// console.log(p1);

	this.line = new Path.Line(p1.nextPoint, p2.nextPoint);
	this.line.style = lineStyle;
	this.line.sendToBack();

	this.nextP1 = p1.nextPoint;
	this.nextP2 = p2.nextPoint;

	var deleting = false;
	this.delLine = function() {
		this.line.remove();
	}
	this.line.onMouseDown = function(event) {
		// body...
	}.bind(this);
	this.line.onDoubleClick = function(event) {
		this.line.strokeColor.alpha -= 0.05;
		this.line.remove();
	}.bind(this);
	this.line.onMouseUp = function(event) {
		deleting = false;
	}.bind(this);


	this.move = function() {
		if (this.nodes[0].dragging === true || this.nodes[1].dragging === true) {
			this.nextP1 = this.nodes[0].nextPoint;
			this.nextP2 = this.nodes[1].nextPoint;

			// Implementation of movement. Lines following Nodes. 
			this.line.firstSegment.point = this.nextP1;
			this.line.lastSegment.point = this.nextP2;
		} else {
			// Force & movement functions
			// this.line.rotate(3);


			// Implementation of movement. Nodes following Lines. 
			this.nodes[0].nextPoint = this.line.firstSegment.point;
			this.nodes[1].nextPoint = this.line.lastSegment.point;

		}
	}
}

function Adder() {
	this.node = new Path.Circle(new Point(view.bounds.width - 100, view.bounds.height - 100), radius * 1);
	this.node.style = nodeStyle;
	this.node.fillColor = '#019851';
	this.node.strokeWidth /= 1.5;
	this.dragPoint;

	this.adderPoint = function() {
		this.node.position = new Point(view.bounds.width - 100, view.bounds.height - 100);
	}.bind(this);

	this.node.onMouseDown = function(event) {
		mouseDownHolder = this;

		this.dragPoint = this.node.position - event.point

		globals.newNode(this.node.position);
		this.node.bringToFront();
	}.bind(this);

	this.node.onMouseDrag = function(event) {
		// console.log(event.point);
		var locaish = this.dragPoint + event.point;
		Nodes[Nodes.length - 1].node.position = locaish;
	}.bind(this);

	this.mouseUpEvent = function(event) {
		var thisNode = Nodes[Nodes.length - 1];
		if (thisNode.node.position.isClose(this.node.position, radius * 2 + nodeStyle.strokeWidth * 2)) {
			thisNode.del();
		} else {
			thisNode.nextPoint = event.point;
		}

		mouseDownHolder = null; // Clear the global variable from this
	}.bind(this);
}
////////// End of object constructors ////////////






//////////////////////// Other functions

// Initialiser function

window.globals = {
	init: function() {
		project.activeLayer.removeChildren();

		adder = new Adder;

		Nodes = [];
		Lines = [];

		for (var i = 0; i < nodeNum; i++) {
			Nodes[i] = new Node(randPoint(radius, Nodes), i);
		}
		for (var i = 0; i < lineConnections.length; i++) {
			Lines[i] = new Line(Nodes[lineConnections[i].from], Nodes[lineConnections[i].to]);
		}
	},
	newNode: function(loc) {
		Nodes.push(new Node(loc, Nodes.length));
		console.log("Nodes.length: " + Nodes.length);
	}
}



// Returns random integer under max parameter
function randInt(max) {
	return Math.floor(Math.random() * max + 1)
}

// Returns random point whilst avoiding all nodes in the list with specified radius
function randPoint(radius, nodesList) {
	var point;
	var conflict;
	var bounds = view.bounds;
	var boxMargin = radius * 2;
	var frame = new Rectangle(0, 0, bounds.width, bounds.height);
	var newFrame = frame.scale(0.8);

	do {
		conflict = false;
		point = Point.random() * new Rectangle(newFrame.width, newFrame.height) + newFrame.point;
		for (var i = 0; i < Nodes.length; i++) {
			if (point.isClose(Nodes[i].node.position, radius * 3)) {
				conflict = true;
			}
		}
		console.log("Conflict is " + conflict);
	} while (conflict == true);

	return point;
}

function absVector(vector) {
	var newX = Math.sqrt(vector.x * vector.x);
	var newY = Math.sqrt(vector.y * vector.y);
	return new Point(newX, newY);
}





/////////////////////////// Procedures / Main

globals.init();







////////////////////////////////////////////////
///////////// Frame & global events ////////////
////////////////////////////////////////////////
function onFrame(event) {


	for (var i = 0; i < Nodes.length; i++) {
		Nodes[i].move();
	}
	for (var i = 0; i < Lines.length; i++) {
		Lines[i].move();
	}
	adder.node.bringToFront();
}

// Resize viewport event
function onResize(event) {
	adder.adderPoint();
}

function onMouseUp(event) {
	if (mouseDownHolder !== null) {
		console.log("Mouse up on:", mouseDownHolder);
		mouseDownHolder.mouseUpEvent(event);
	} else {
		console.log("Mouse up on", mouseDownHolder);
	}
}


// All items still have their own onMouseDown event, but all onMouseUp events that apply when moved away from the object are taken out and merged into one main onMouseUp event function.
// the OMU function stores the object that triggered the OMD function and, along with its current position will execute the desired task, depending on what was intended by its movement.






// Might need to create master Nodes object that holds all object coordinates in an array. Otherwise have current problem of canvas drawing only lines to whichever objects have already been created.
// With master object can circumvent this by drawing entire aray of nodes first and only then array of lines.
// Truth is master Nodes object doesn't need to hold any of the details, just the drawing functions. You can still have the individual Node objects that hold all relevant data to that object.




// Implementation of edges is that they simply state which two nodes they connect
// Forces needed: 
//  - node repulsion so nodes don't get too close
//  - tension, so lines don't get too long
//  - opposing line repulsion, so that lines of a node will seek to put as much radial size between them and the next one. I.e. the starfish effect. Will ensure that topographic circle displays as actual circle
//  - central gravitation, so nodes don't fly away into the distance
//  - friction maybe? so motion dies down after a while



/*
Design spec:
  - You can add network elements by either clicking the canvas or an 'add' button
  - All balloons will be linkable to each other by dragging lines from one to the other
  - The balloons will rearrange to minimise length of connection lines, whilst maintaining network topography
  - However there will be a minimum length the connection line must be, so that they don't all collapse on one another
  - Similarly the balloons cannot overlap one another, even if not linked
  - Balloons will sway somewhat around their locations, connections permitting

  Potentials:
  - Somehow dragging a balloon will make it more likely to stay in the dropped area

  */
