const svgNS = "http://www.w3.org/2000/svg";
const form = document.getElementById("graph-input-form");

const graphInputArea = document.getElementById('graph-input');
const graphWeightBtns = document.querySelectorAll('input[name="graph-weight"]');
const graphTypeBtns = document.querySelectorAll('input[name="graph-type"]');

const graphTypeElement = document.getElementById("graph-type");
const graphWeightElement = document.getElementById("graph-weight");
const graphEdgesElement = document.getElementById("graph-edges");


const errorDiv = document.querySelector("#error");


const graphArea = document.querySelector(".graph-display-area");

let graph = {};
let errorList = [];

/*------- graph input placeholder functionality ------*/


function updateGraphPlaceholder() {
    const selectedWeight = document.getElementById('weighted').checked;
    graphInputArea.value = ``; //clear if any value is present
    console.log("update")

    if (selectedWeight) {
        // Weighted graph placeholder: node1 node2 weight
        graphInputArea.placeholder = `Example:\nNode Node Weight\n1 2 5\n3 2 7\n2 3 4\n4 5 6`;
    } else {
        // Non-weighted graph placeholder: node1 node2
        graphInputArea.placeholder = `Example:\nNode Node\n1 2\n3 2\n2 3\n4 5`;
    }
    
}

// Set placeholder on page load
window.addEventListener('load', () => {
    resetForm();
});

// Update placeholder on radio change
graphWeightBtns.forEach(btn => btn.addEventListener('change', updateGraphPlaceholder));


/*------- graph input placeholder functionality ------*/





/*------- graph input parsing into JSON functionality ------*/

function convertIntoJSON(event) {
    event.preventDefault();

    const graphInputJSON = {};

    const isDirected = document.getElementById('directed').checked;
    graphInputJSON["directed"] = isDirected;

    const isWeighted = document.getElementById('weighted').checked;
    graphInputJSON["weighted"] = isWeighted;

    
    const graphEdges = graphInputArea.value.trim();
    const edges = graphEdges.split("\n");
    const edgeList = [];
    const nodeSet = new Set();

    edges.forEach((edge) => {
        if (!edge.trim()) return;  
        
        const vertices = edge.trim().split(/\s+/);
        if (vertices.length < 2) return;

        const from = vertices[0];
        const to = vertices[1];

        //check for duplicate edges
        const isDuplicate = edgeList.some((e) => {
            if(isDirected) {
                return from === e.from && to === e.to;
            }
            else {
                return (from === e.from && to === e.to) || (from === e.to && to === e.from);
            }
        });


        if(isDuplicate) return;

        if (isWeighted) {
            const weight = vertices[2];
            edgeList.push({ "from": from, "to": to, "weight": weight });
        } else {
            edgeList.push({ "from": from, "to": to });
        }

        nodeSet.add(from);
        nodeSet.add(to);
    });


    graphInputJSON["edges"] = edgeList;
    graphInputJSON["nodes"] = Array.from(nodeSet);

    console.log(graphInputJSON);
    return graphInputJSON;
}


/*------- graph input parsing into JSON functionality ------*/


/*------- graph input validation ------*/

form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateInput(event);
});

function validateInput(event) {
    let isValid = true;


    //check graph type
    if( !graphTypeBtns[0].checked && !graphTypeBtns[1].checked) {
        isValid = false;

        const errorElement = createErrorElement('#graph-type', 'Please select Graph Type', graphTypeElement);
        errorList.push(errorElement);
    }


    //check graph weight
    if( !graphWeightBtns[0].checked && !graphWeightBtns[1].checked) {
        isValid = false;

        const errorElement = createErrorElement('#graph-weight', 'Please select Graph Weight', graphWeightElement);
        errorList.push(errorElement);

    }


    // check graph edges
    const graphEdges = graphInputArea.value;
    const isWeighted = document.getElementById('weighted').checked;

    if(graphEdges.trim() === "") {
        isValid = false;

        const errorElement = createErrorElement('#graph-input', 'Please enter Graph Edges', graphEdgesElement);
        
        errorList.push(errorElement);
    }
    else if(checkEdgesFormat(graphEdges, isWeighted) == false) {
        isValid = false;

        const errorElement = createErrorElement('#graph-input', 'Invalid Format', graphEdgesElement);

        errorList.push(errorElement);
    }
    
    
    
    //if all are valid
    if (isValid) {
        graph = convertIntoJSON(event)
        drawGraph(graph);
    }
    else {
        updateErrorDiv(errorList);
    }
}

function checkEdgesFormat(value, isWeighted) {
    const pattern = isWeighted
        ? /^(\s*\d+\s+\d+\s+\d+\s*\n?)+$/       // weighted: 3 numbers
        : /^(\s*\d+\s+\d+\s*\n?)+$/;            // non-weighted: 2 numbers
    return pattern.test(value.trim());
}

function createErrorElement(href, textContent, container) {
    const errorElement = document.createElement('li');
        
    const link = document.createElement('a');
    link.href = href;
    link.textContent = textContent;
    link.addEventListener('click', () => highlightErrorDiv(container));

    errorElement.appendChild(link);

    return {
            id: href,
            errorElement: errorElement,
        };
}

function highlightErrorDiv(divElement) {
    divElement.classList.add("error");
}

function updateErrorDiv(errorList) {
        console.log(errorList)
        if(errorList.length === 0) {
            errorDiv.innerHTML = ``;
            errorDiv.classList.remove("active");
            return;
        }
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = `
            Error(s) in input
        `;
        const errorListElement = document.createElement('ul');
        errorList.forEach((err) => errorListElement.appendChild(err.errorElement));
        errorMsg.appendChild(errorListElement);
        
        //add to page
        errorDiv.innerHTML = ``;
        errorDiv.classList.add("active");
        errorDiv.replaceChildren(errorMsg);
}

//remove highlight when input is entered
graphTypeBtns.forEach((btn) => {
    btn.addEventListener('change', () => {
        if (graphTypeElement.classList.contains("error"))
            graphTypeElement.classList.remove("error");
            errorList = errorList.filter(err => err.id !== "#graph-type");
            //update error div after removing errors
            updateErrorDiv(errorList);
    });
});

graphWeightBtns.forEach((btn) => {
    btn.addEventListener('change', () => {
        if(graphWeightElement.classList.contains("error"))
            graphWeightElement.classList.remove("error");
            errorList = errorList.filter(err => err.id !== "#graph-weight");
            //update error div after removing errors
            updateErrorDiv(errorList);
    });
});

graphInputArea.addEventListener('input', () => {
    if (graphInputArea.value.trim() !== "") {
        if(graphEdgesElement.classList.contains("error")) graphEdgesElement.classList.remove("error");
        errorList = errorList.filter(err => err.id !== "#graph-input");
        console.log(errorList)
        //update error div after removing errors
        updateErrorDiv(errorList);
    }
});



/*------- graph input validation ------*/


/*------- clear graph input and output------*/
function resetForm() {

    form.reset();

    clearErrors();

    updateGraphPlaceholder();
    clearGraph();
}

function clearErrors() {
    
    errorDiv.innerHTML = ``;
    errorDiv.classList.remove("active");

    //remove error highlight if any
    graphTypeElement.classList.remove("error");
    graphWeightElement.classList.remove("error");
    graphEdgesElement.classList.remove("error");

}


function clearGraph() {
    graphArea.innerHTML = `<div class="no-graph">No Data to display</div>`;
}

/*------- clear graph input and output------*/


/*------- draw graph  ------*/

window.addEventListener('resize', () => {
    console.log("Resized");
    //if not empty
    if(JSON.stringify(graph) !== '{}')   drawGraph(graph);
});

function drawGraph(graph) {

    const svg_width = graphArea.clientWidth;
    const svg_height = graphArea.clientHeight;
    const radius = Math.min(svg_width, svg_height) * 0.4;
    const nodeRadius = Math.min(svg_width, svg_height) * 0.05;

    //calculate positions of nodes - circular layout
    const positions = calculatePositions(graph, svg_width, svg_height, radius);
    console.log(positions);

    //set up svg container
    const graphSVG = document.createElementNS(svgNS, "svg");

    graphSVG.setAttribute("width", svg_width);
    graphSVG.setAttribute("height", svg_height);

    graphSVG.setAttribute("viewBox", `0 0 ${svg_width} ${svg_height}`);
    graphSVG.setAttribute("id", "graph");

    // graphSVG.addEventListener("click", removeEdgeHighlight);

    graphArea.replaceChildren(graphSVG);

    //draw edges
    drawEdges(graphSVG, graph.edges, positions, graph.directed, graph.weighted, nodeRadius);

    //draw nodes
    drawNodes(graphSVG, graph.nodes, positions, nodeRadius);

    document.querySelector('.output-container').scrollIntoView({ behavior:"smooth" })

}

function calculatePositions(graph, width, height, radius) {
    const centerX = width / 2;
    const centerY = height / 2;
    const totalNodes = graph.nodes.length;
    const nodes = graph.nodes;
    const positions = {};
    for(let i = 0 ; i < totalNodes ; i++) {
        const node = nodes[i];
        const angle = (2 * Math.PI * i) / totalNodes - (Math.PI / 2);

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        positions[node] = {x:x, y:y};
    }

    return positions;
}

function drawEdges(svg, edges, position, isDirected, isWeighted, nodeRadius) {

    if(isDirected) {
            const defs = document.createElementNS(svgNS, "defs");
            const arrowMarker = document.createElementNS(svgNS, "marker");
            arrowMarker.setAttribute("id", "arrow");
            arrowMarker.setAttribute("viewBox", "0 0 10 10");
            arrowMarker.setAttribute("markerWidth", 10);
            arrowMarker.setAttribute("markerHeight", 10);
            arrowMarker.setAttribute("refX", 10);
            arrowMarker.setAttribute("refY", 5);
            arrowMarker.setAttribute("orient", "auto");

            const arrowPath = "M 0 0 L 10 5 L 0 10 z";
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", arrowPath)
            path.setAttribute("fill", "black");

            arrowMarker.appendChild(path);
            defs.appendChild(arrowMarker);

            console.log(defs);
            console.log(arrowMarker);
            console.log(path);

            svg.appendChild(defs);
    }

    edges.forEach((edge) => {
        let x1 = position[edge.from].x;
        let y1 = position[edge.from].y;
        let x2 = position[edge.to].x;
        let y2 = position[edge.to].y;


        // ------ FIX: shorten the line so arrow is not hidden behind circle ------
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy);
        const r = nodeRadius; // node radius

        x2 = x2 - (dx / len) * r;
        y2 = y2 - (dy / len) * r;

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("class", "edge");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "black");

        
        if(isDirected) {
            line.setAttribute("marker-end", 'url(#arrow)');
        }
        
        if(isWeighted) {
            const weightLabel = document.createElementNS(svgNS, "text");
            const midPoint = calculateMidPoint(x1, y1, x2, y2);
            
            weightLabel.setAttribute("x", midPoint.x);
            weightLabel.setAttribute("y", midPoint.y);
            weightLabel.setAttribute("dx", "2%");
            weightLabel.setAttribute("dy", "2%");
            weightLabel.innerHTML = edge.weight;
            weightLabel.setAttribute("class", "weight-label");
            weightLabel.addEventListener("click", () => highlightEdge(line));
            
            svg.appendChild(weightLabel);
        }
        svg.appendChild(line);
    });
}

function drawNodes(svg, nodes, positions, nodeRadius) {
    nodes.forEach((node) => {
        const position = positions[node];
        const circle = document.createElementNS(svgNS, "circle");
        // circle.setAttribute("id", "circle");
        circle.setAttribute("cx", position.x);
        circle.setAttribute("cy", position.y);
        circle.setAttribute("r", nodeRadius);
        circle.setAttribute("fill", "green");

        const nodeLabel = document.createElementNS(svgNS, "text");
        nodeLabel.innerHTML = node;
        nodeLabel.setAttribute("class", "node-label");
        nodeLabel.setAttribute("x", position.x);
        nodeLabel.setAttribute("y", position.y);

        svg.appendChild(circle);
        svg.appendChild(nodeLabel);
    });
}

function calculateMidPoint(x1, y1, x2, y2) {
    const midPoint = {};
    midPoint["x"] = (x1 + x2) / 2;
    midPoint["y"] = (y1 + y2) / 2;
    return midPoint;
}

function highlightEdge(line) {
    line.classList.toggle("highlight");
}

function removeEdgeHighlight() {
    const edges = document.querySelectorAll(".edge");
    edges.forEach((edge) => {
        edge.classList.remove("highlight");
    });
}

/*------- draw graph  ------*/



/*------- footer form related functionality ------*/

const footerForm = document.querySelector('.footer-form-container');

function openFooterForm() {
    footerForm.style.display = 'flex';
}

function closeFooterForm() {
    footerForm.style.display = 'none';
}

document.addEventListener('click', (e) => {
    if (e.target == footerForm)
        closeFooterForm();
});

/*------- footer form related functionality ------*/