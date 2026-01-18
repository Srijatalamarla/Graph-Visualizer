const SVGNS = "http://www.w3.org/2000/svg";
const graphArea = document.querySelector(".graph-display-area");


const EXPORT_WIDTH = 800;
const EXPORT_HEIGHT = 600;

export function drawGraph(graph) {

    if(JSON.stringify(graph) === '{}')
        return;

    const svg_width = graphArea.clientWidth;
    const svg_height = graphArea.clientHeight;

    const graphSVG = renderGraph(graph, svg_width, svg_height, false);

    graphArea.replaceChildren(graphSVG);
}

export function exportGraph(graph) {
    
    if(JSON.stringify(graph) === '{}')
        return;

    const exportGraphSVG = renderGraph(graph, EXPORT_WIDTH, EXPORT_HEIGHT, true);

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

    //set up svg container
    const graphSVG = document.createElementNS(SVGNS, "svg");

    graphSVG.setAttribute("width", svg_width);
    graphSVG.setAttribute("height", svg_height);

    graphSVG.setAttribute("viewBox", `0 0 ${svg_width} ${svg_height}`);

    if(forExport === true) {
        const rect = document.createElementNS(SVGNS, "rect");
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
    
    const edgesGroup = document.createElementNS(SVGNS, "g");

    if(isDirected) edgesGroup.appendChild(addArrow());

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

            const path = document.createElementNS(SVGNS, "path");
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
                const weightLabel = document.createElementNS(SVGNS, "text");
                
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
            return;
        }
        // ------ FIX: shorten the line so arrow is not hidden behind circle ------
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy);

        x2 = x2 - (dx / len) * r;
        y2 = y2 - (dy / len) * r;

        const line = document.createElementNS(SVGNS, "line");
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
            const weightLabel = document.createElementNS(SVGNS, "text");
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

function addArrow() {
    
    const defs = document.createElementNS(SVGNS, "defs");
    const arrowMarker = document.createElementNS(SVGNS, "marker");
    arrowMarker.setAttribute("id", "arrow");
    arrowMarker.setAttribute("viewBox", "0 0 10 10");
    arrowMarker.setAttribute("markerWidth", 10);
    arrowMarker.setAttribute("markerHeight", 10);
    arrowMarker.setAttribute("refX", 10);
    arrowMarker.setAttribute("refY", 5);
    arrowMarker.setAttribute("orient", "auto");

    const arrowPath = "M 0 0 L 10 5 L 0 10 z";
    const path = document.createElementNS(SVGNS, "path");
    path.setAttribute("d", arrowPath)
    path.setAttribute("fill", "black");

    arrowMarker.appendChild(path);
    defs.appendChild(arrowMarker);

    return defs;
}

function createCubicBezierPath(startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY) {
    // M = move to, C = cubic curve
    return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}

function drawNodes(nodes, positions, nodeRadius) {
    
    const nodesGroup = document.createElementNS(SVGNS, "g");

    nodes.forEach((node) => {
        const position = positions[node];
        const circle = document.createElementNS(SVGNS, "circle");
        circle.setAttribute("cx", position.x);
        circle.setAttribute("cy", position.y);
        circle.setAttribute("r", nodeRadius);
        circle.setAttribute("fill", "green");

        nodesGroup.appendChild(circle);
    });
    return nodesGroup;
}

function drawLabels(nodes, positions) {
    const labelsGroup = document.createElementNS(SVGNS, "g");

    nodes.forEach((node) => {
        const position = positions[node];

        const nodeLabel = document.createElementNS(SVGNS, "text");
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