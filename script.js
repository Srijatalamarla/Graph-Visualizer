const form = document.getElementById("graph-input-form");
const graphInputJSON = {};

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
    const formData = new FormData(event.target);

    formData.forEach((value, key) => {
        graphInputJSON[key] = value;
    })

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

    if( !graphTypeBtns[0].checked && !graphTypeBtns[1].checked) {
        isValid = false;

        const errorElement = document.createElement('li');

        const link = document.createElement('a');
        link.href = '#graph-type';
        link.textContent = 'Please select Graph Type';
        link.addEventListener('click', () => highlightErrorDiv(graphTypeElement));

        errorElement.appendChild(link);
        errorList.push(errorElement);

        //higlight with color
    }

    if( !graphWeightBtns[0].checked && !graphWeightBtns[1].checked) {
        isValid = false;

        const errorElement = document.createElement('li');
        
        const link = document.createElement('a');
        link.href = '#graph-weight';
        link.textContent = 'Please select Graph Weight';
        link.addEventListener('click', () => highlightErrorDiv(graphWeightElement));

        errorElement.appendChild(link);
        errorList.push(errorElement);

        
        //higlight with color
    }

    const graphEdges = graphInputArea.value;
    if(graphEdges !== "") {
        console.log(graphEdges.split("\n"));
    }
    else {
        isValid = false;

        const errorElement = document.createElement('li');
        
        const link = document.createElement('a');
        link.href = '#graph-input';
        link.textContent = 'Please Enter Graph Edges';
        link.addEventListener('click', () => highlightErrorDiv(graphEdgesElement));

        errorElement.appendChild(link);
        errorList.push(errorElement);

        
        //higlight with color
    }


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
        document.querySelector("#error").appendChild(errorMsg);
    }
}


function highlightErrorDiv(divElement) {
    divElement.style.border = '1px solid red';
}

//remove highlight when input is entered
graphTypeBtns.forEach((btn) => {
    btn.addEventListener('change', () => {
        graphTypeElement.style.border = 'none'

        //again validate
        validateInput();
    });
});

graphWeightBtns.forEach((btn) => {
    btn.addEventListener('change', () => {graphWeightElement.style.border = 'none'});
});

graphInputArea.addEventListener('input', () => {
    if (graphInputArea.value.trim() !== "") {
        graphEdgesElement.style.border = 'none';
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