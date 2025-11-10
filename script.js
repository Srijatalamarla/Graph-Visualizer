const form = document.getElementById("graph-input-form");

const graphInputArea = document.getElementById('graph-input');
const graphWeightBtns = document.querySelectorAll('input[name="graph-weight"]');
const graphTypeBtns = document.querySelectorAll('input[name="graph-type"]');

const graphTypeElement = document.getElementById("graph-type");
const graphWeightElement = document.getElementById("graph-weight");
const graphEdgesElement = document.getElementById("graph-edges");

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
window.addEventListener('load', updateGraphPlaceholder);

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

        if (isWeighted) {
            const weight = vertices[2];
            edgeList.push({ "from": from, "to": to, "weight": weight });
        } else {
            edgeList.push({ "from": from, "to": to });
        }

        nodeSet.push(from);
        nodeSet.push(to);
    });


    graphInputJSON["edges"] = edgeList;
    graphInputJSON["nodes"] = Array.from(nodeSet);

    console.log(graphInputJSON);
}


/*------- graph input parsing into JSON functionality ------*/


/*------- graph input validation ------*/

form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateInput(event);
});

function validateInput(event) {
    let isValid = true;

    let errorList = [];


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

        const errrorElement = createErrorElement('#graph-input', 'Invalid Format', graphEdgesElement);

        errorList.push(errrorElement);
    }



    //if all are valid
    if (isValid)
        convertIntoJSON(event)
    else {
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = `
            There was an error in your input
        `;
        const errorListElement = document.createElement('ul');
        errorList.forEach((err) => errorListElement.appendChild(err));
        errorMsg.appendChild(errorListElement);
        
        //add to page
        const errorDiv = document.querySelector("#error");
        errorDiv.innerHTML = ``;
        errorDiv.replaceChildren(errorMsg);
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

    return errorElement;
}

function highlightErrorDiv(divElement) {
    divElement.classList.add("error");
}

//remove highlight when input is entered
graphTypeBtns.forEach((btn) => {
    btn.addEventListener('change', () => {
        if (graphTypeElement.classList.contains("error"))
            graphTypeElement.classList.remove("error");
    });
});

graphWeightBtns.forEach((btn) => {
    btn.addEventListener('change', () => {
        if(graphWeightElement.classList.contains("error"))
            graphWeightElement.classList.remove("error");
    });
});

graphInputArea.addEventListener('input', () => {
    if (graphInputArea.value.trim() !== "" && graphEdgesElement.classList.contains("error")) {
        graphEdgesElement.classList.remove("error");
    }
});
/*------- graph input validation ------*/


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