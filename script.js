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
const downloadBtn = document.querySelector(".download-btn");

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
    const isValid = validateInput();
    
    //if all are valid
    if (isValid) {
        graph = convertIntoJSON(event)
        drawGraph(graph);
        
        downloadBtn.removeAttribute('disabled');
        document.querySelector('.output-container').scrollIntoView({ behavior:"smooth" });
    }
    else {
        updateErrorDiv(errorList);
    }
});

function validateInput() {
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
    
    
    return isValid;
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
    console.log("Reset");
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
    downloadBtn.setAttribute('disabled', 'true');
}

/*------- clear graph input and output------*/


/*------- draw graph  ------*/

window.addEventListener('resize', () => {
    console.log("Resized");
    //if not empty
    if(JSON.stringify(graph) !== '{}')   drawGraph(graph);
});

function drawGraph(graph) {

    if(JSON.stringify(graph) === '{}')
        return;

    const svg_width = graphArea.clientWidth;
    const svg_height = graphArea.clientHeight;

    const graphSVG = renderGraph(graph, svg_width, svg_height, false);

    graphArea.replaceChildren(graphSVG);
}

function exportGraph() {
    
    if(JSON.stringify(graph) === '{}')
        return;

    const EXPORT_WIDTH = 800;
    const EXPORT_HEIGHT = 600;

    const exportGraphSVG = renderGraph(graph, EXPORT_WIDTH, EXPORT_HEIGHT, true);

    console.log(exportGraphSVG);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(exportGraphSVG);

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function renderGraph(graph, svg_width, svg_height, forExport) {
    
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

    if(forExport === true) {
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("width", svg_width);
        rect.setAttribute("height", svg_height);
        rect.setAttribute("fill", "white");
        graphSVG.appendChild(rect);
    }

    const edgesGroup = drawEdges(graph.edges, positions, graph.directed, graph.weighted, nodeRadius);
    const nodesGroup = drawNodes(graph.nodes, positions, nodeRadius);
    const labelsGroup = drawLabels(graph.nodes, positions);

    graphSVG.appendChild(edgesGroup);
    graphSVG.appendChild(nodesGroup);
    graphSVG.appendChild(labelsGroup);

    return graphSVG;

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

function drawEdges(edges, position, isDirected, isWeighted, nodeRadius) {
    
    const edgesGroup = document.createElementNS(svgNS, "g");

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

            edgesGroup.appendChild(defs);
    }

    edges.forEach((edge) => {
        
        let x1 = position[edge.from].x;
        let y1 = position[edge.from].y;
        let x2 = position[edge.to].x;
        let y2 = position[edge.to].y;
        const r = nodeRadius; // node radius
        
        
        if(edge.from === edge.to) {
            //self loop
            const delta = Math.PI / 8; // gap angle (~22.5°)

            const angleStart = -Math.PI / 2 - delta;
            const angleEnd   = -Math.PI / 2 + delta;

            const startX = x1 + r * Math.cos(angleStart);
            const startY = y1 + r * Math.sin(angleStart);

            const endX = x1 + r * Math.cos(angleEnd);
            const endY = y1 + r * Math.sin(angleEnd);

            const offsetX = 1.5 * r;
            const offsetY = 2.0 * r;

            const cx1 = x1 - offsetX;
            const cy1 = y1 - offsetY;

            const cx2 = x1 + offsetX;
            const cy2 = y1 - offsetY;

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("class", "edge");
            path.setAttribute("stroke", "black");
            path.setAttribute("fill", "transparent");
            
            const pathData = createCubicBezierPath(
                startX, startY,
                cx1, cy1,
                cx2, cy2,
                endX, endY
            );

            path.setAttribute("d", pathData);

            if (isDirected) {
                path.setAttribute("marker-end", "url(#arrow)");
            }

            if(isWeighted) {
                const weightLabel = document.createElementNS(svgNS, "text");
                
                weightLabel.setAttribute("x", x1 + 1);
                weightLabel.setAttribute("y", cy1 + 1) ;
                weightLabel.innerHTML = edge.weight;
                weightLabel.setAttribute("class", "weight-label");
                weightLabel.addEventListener("click", () => highlightEdge(path));
                weightLabel.setAttribute("style", `
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-anchor: middle;
                    dominant-baseline: middle;
                `);
                
                edgesGroup.appendChild(weightLabel);
            }

            edgesGroup.appendChild(path);
            // console.log(path);
            return;
        }
        // ------ FIX: shorten the line so arrow is not hidden behind circle ------
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy);

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
            weightLabel.setAttribute("style", `
                font-family: Arial, Helvetica, sans-serif;
                font-size: 1.5rem;
                font-weight: 700;
                text-anchor: middle;
                dominant-baseline: middle;
            `);
            
            edgesGroup.appendChild(weightLabel);
        }
        edgesGroup.appendChild(line);
    });
    return edgesGroup;
}

function createCubicBezierPath(startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY) {
    // M = move to, C = cubic curve
    return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}

function drawNodes(nodes, positions, nodeRadius) {
    
    const nodesGroup = document.createElementNS(svgNS, "g");

    nodes.forEach((node) => {
        const position = positions[node];
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", position.x);
        circle.setAttribute("cy", position.y);
        circle.setAttribute("r", nodeRadius);
        circle.setAttribute("fill", "green");

        nodesGroup.appendChild(circle);
    });
    return nodesGroup;
}

function drawLabels(nodes, positions) {
    const labelsGroup = document.createElementNS(svgNS, "g");

    nodes.forEach((node) => {
        const position = positions[node];

        const nodeLabel = document.createElementNS(svgNS, "text");
        nodeLabel.innerHTML = node;
        nodeLabel.setAttribute("class", "node-label");
        nodeLabel.setAttribute("x", position.x);
        nodeLabel.setAttribute("y", position.y);
        nodeLabel.setAttribute("style", `
            font-family: Arial, Helvetica, sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            fill: white;
            text-anchor: middle;
            dominant-baseline: middle;
        `);

        labelsGroup.appendChild(nodeLabel);
    });

    return labelsGroup;
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