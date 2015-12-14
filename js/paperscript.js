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
function Node(pos) {

	// Assigns random position if none specified
	this.nextPoint = pos ? pos : randPoint(radius, Nodes);

	// Creates the Path
	this.node = new Path.Circle(this.nextPoint, radius);
	this.node.style = nodeStyle;

	// initialises nextPoint to current position
	// this.nextPoint = this.node.position;

	// this.nodeID = nodeID; // Needs to be assigned
	this.selected = false; // Gets set to true for deleting this Node from the Nodes array
	this.newNode = false;
	this.lines = []; // Where all connecting lines will be referenced


	this.move = function() {
		// if (this.dragging) {
		this.node.position = this.nextPoint;
		// }
	}

	// Drag and drop capabilities 
	this.dragging = false;
	this.linking = false;

	this.del = function() {
		this.selected = true; // So that it can be identified from outside
		// Removes all lines associated with this Node
		for (var i = 0; i < this.lines.length; i++) {
			this.lines[i].line.remove();
		}

		// loops through array and deletes this Node based on its being 'selected'
		for (var i = 0; i < Nodes.length; i++) {
			if (Nodes[i].selected === true) {
				Nodes[i].node.remove();
				Nodes.splice(i, 1);
			}
		}
	}

	this.dragPoint = null;
	this.mouseDownEvent = function(event) {
		mouseDownHolder = this; // Assigns this Node object to the holder
		this.node.bringToFront();

		var middleClicked = event.point.isClose(this.node.position, radius - stroke / 2);

		if (this.newNode === true || middleClicked) {
			this.dragging = true;
			if (!this.newNode) this.node.style = highlightStyle;
			this.dragPoint = this.nextPoint - event.point;
			// console.log("Clicked middle");
		} else {
			// Lines[Lines.length] = new Line(this, Nodes[randInt(Nodes.length - 1)]);
			Lines[Lines.length] = new Line(this);
			Lines[Lines.length - 1].mouseDownEvent(event);

			// console.log("Clicked edge");
		}
	}

	this.mouseDragEvent = function(event) {
		if (this.dragging) {
			this.nextPoint = this.dragPoint + event.point;
		} else {
			Lines[Lines.length - 1].mouseDragEvent(event);
		}
	}

	this.mouseUpEvent = function(event) {
		if (this.dragging) {
			this.nextPoint = this.dragPoint + event.point;
			this.node.style = nodeStyle;
			this.dragging = false;
		}

		mouseDownHolder = null; // Clear the global variable from this
	}


	/// Technical mouse events. They only call the better defined functions above.
	this.node.onMouseDown = function(event) {
		this.mouseDownEvent(event);
	}.bind(this);

	this.node.onMouseDrag = function(event) {
		this.mouseDragEvent(event);
	}.bind(this);

	// Node delete
	this.node.onDoubleClick = function(event) {
		if (event.point.isClose(this.node.position, radius - stroke / 2)) {
			this.del();
		}
	}.bind(this);
}





//////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// Line constructor! 
function Line(node1, node2) {
	console.log("Lines.length", Lines.length);


	this.nodes = [node1]; // Assigns first Node to nodes array
	node1.lines.push(this);

	if (node2) { // If was given a 2nd Node as input parameter

		this.nodes.push(node2); // Assigns 2nd Node to nodes array
		node2.lines.push(this); // Pushes itself into the Node's lines array

		// Draws the actual line path
		this.line = new Path.Line(node1.nextPoint, node2.nextPoint);

	} else {
		// Draws the actual line path
		this.line = new Path.Line(node1.nextPoint, node1.nextPoint);
	}

	// Line style stuff
	this.line.style = lineStyle;
	this.line.sendToBack();







	// Handle for selecting this Line when deleting
	this.selected = false;

	this.del = function() {
		this.selected = true;
		for (var i = 0; i < Lines.length; i++) {
			if (Lines[i].selected === true) {
				Lines[i].line.remove(); // Removes line path
				// Removes references to line in the Line's two owner Nodes
				for (var j = 0; j < node1.lines.length; j++) {
					if (node1.lines[j].selected === true) node1.lines.splice(j, 1);
				}
				if (this.nodes.length > 1) { // Only deletes itself from 2nd Node's lines array if it has a 2nd Node
					for (var j = 0; j < this.nodes[1].lines.length; j++) {
						if (this.nodes[1].lines[j].selected === true) this.nodes[1].lines.splice(j, 1);
					}
				}

				Lines.splice(i, 1); // Removes itself from global Lines array
				this.line.remove(); // Removes canvas line
				break;
			}
		}
	}

	this.move = function() {
		this.line.firstSegment.point = this.nodes[0].nextPoint;
		if (this.nodes.length > 1) { // Only updates 2nd end's position if it's attached to a Node
			this.line.lastSegment.point = this.nodes[1].nextPoint;
		}
	}

	/// Mouse events
	this.mouseDownEvent = function(event) {
		mouseDownHolder = this; // Assigns this Line object to the global holder
		if (this.nodes.length > 1) {
			this.line.lastSegment.point = event.point;
		}
	}

	this.mouseDragEvent = function(event) {
		this.line.lastSegment.point = event.point;
	}

	this.mouseUpEvent = function(event) {
		var secondNode = null;
		var leastDistance = 1000;
		for (var i = 0; i < Nodes.length; i++) {
			var currNodeDistance = event.point.getDistance(Nodes[i].nextPoint);

			if (currNodeDistance < leastDistance) {
				leastDistance = currNodeDistance;
				secondNode = Nodes[i];
			}
		}

		if (this.nodes.length < 2) { // if Line only has one Node attached to it, releasing the mouse button deletes the Line

			if (leastDistance < radius) {
				/// Adds second Node
				this.nodes.push(secondNode);
				this.nodes[1].lines.push(this);
				this.line.remove();
				this.line = new Path.Line(this.nodes[0].nextPoint, this.nodes[1].nextPoint);
				// Line style stuff
				this.line.style = lineStyle;
				this.line.sendToBack();
				console.log("Line close enough to a Node :)");
			} else {
				this.del();
				console.log("Line not close enough to a Node.");
			}
		}




		mouseDownHolder = null;
	}


	/// Technical mouse events. They only call the better defined functions above.
	this.line.onMouseDown = function(event) {
		this.mouseDownEvent(event);
	}.bind(this);

	this.line.onMouseDrag = function(event) {
		this.mouseDragEvent(event);
	}.bind(this);

	this.line.onDoubleClick = function(event) {
		// this.line.strokeColor.alpha -= 0.05;
		this.del();
	}.bind(this);

}





function Adder() {
	var margin = 100;
	// Creates the circle
	this.node = new Path.Circle(new Point(view.bounds.width - margin, view.bounds.height - margin), radius * 1);
	this.node.style = nodeStyle;
	this.node.fillColor = '#019851';
	this.node.strokeWidth /= 1.5;

	var dragPoint; // For dragging

	this.adderPoint = function() {

		this.node.position = new Point(view.bounds.width - margin, view.bounds.height - margin);
	}.bind(this);

	var thisNode = null; // To be assigned to the new Node to be created

	this.node.onMouseDown = function(event) {

		globals.newNode(this.node.position); // Creates new Node
		thisNode = Nodes[Nodes.length - 1]; // Selects new Node
		thisNode.newNode = true;

		thisNode.mouseDownEvent(event);

		mouseDownHolder = this; // Assigns the Adder to the holder

		this.node.bringToFront();
	}.bind(this);

	this.node.onMouseDrag = function(event) {

		thisNode.mouseDragEvent(event);

	}.bind(this);


	this.mouseUpEvent = function(event) {
		thisNode.mouseUpEvent(event); // Activates the mouseUpEvent for the Node last created
		// Checks if Node is too close to Adder
		if (thisNode.node.position.isClose(this.node.position, radius * 2 + nodeStyle.strokeWidth * 1.5)) {
			thisNode.del(); // Deletes Node
			console.log("Was too close! Drag it further out.");
		} else {
			console.log("Was far enough. Enjoy your new Node.");
			thisNode.newNode = false; // Node is not new anymore
		}
		mouseDownHolder = null; // Clear the global variable from this
	}
}
////////// End of object constructors ////////////






//////////////////////// Other functions


// Global functions: funcs that need to be accesible from the main JS context
window.globals = {
	// Initialiser function
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
	// Create a new Node
	newNode: function(loc) {
		Nodes.push(new Node(loc));
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
		// console.log("Conflict is " + conflict);
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
	// console.log("mouseDownHolder:", mouseDownHolder);
}

// Resize viewport event
function onResize(event) {
	adder.adderPoint();
}

// Universal onMouseUp event - which executes selected object's individually defined mouseUpEvent function.
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
