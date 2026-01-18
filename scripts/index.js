import { closeFooterForm, openFooterForm } from "./footerFunctionality.js";
import { drawGraph, exportGraph } from "./graphFunctionality.js";

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
            if(vertices.length !== 3)   return;
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
    
    // console.log(graphInputJSON);
    return graphInputJSON;
}


/*------- graph input parsing into JSON functionality ------*/

form.addEventListener('reset', resetForm);

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
    const lines = value.trim().split("\n");

    const unweightedPattern = /^[A-Za-z0-9_]+\s+[A-Za-z0-9_]+$/;
    const weightedPattern   = /^[A-Za-z0-9_]+\s+[A-Za-z0-9_]+\s+\d+$/;

    for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (isWeighted) {
            if (!weightedPattern.test(trimmed)) {
                return false;
            }
        } else {
            if (!unweightedPattern.test(trimmed)) {
                return false;
            }
        }
    }

    return true;
}


/*------- graph input validation ------*/


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

        //update error div after removing errors
        updateErrorDiv(errorList);
    }
});





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
    downloadBtn.setAttribute('disabled', 'true');
}

/*------- clear graph input and output------*/


/*------- draw graph  ------*/

window.addEventListener('resize', () => {
    //if not empty
    if(JSON.stringify(graph) !== '{}')   drawGraph(graph);
});

downloadBtn.addEventListener('click', () => {
    if(JSON.stringify(graph) !== '{}')  exportGraph(graph);
});

/*------- draw graph  ------*/



/*------- footer form related functionality ------*/

const footerForm = document.querySelector('.footer-form-container');
const formOpenBtn = document.getElementById('footer-form-open-button');
const formCloseBtn = document.getElementById('footer-form-close-button');

formOpenBtn.addEventListener('click', openFooterForm);
formCloseBtn.addEventListener('click', closeFooterForm);

document.addEventListener('click', (e) => {
    if (e.target == footerForm)
        closeFooterForm();
});

/*------- footer form related functionality ------*/