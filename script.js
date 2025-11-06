

/*------- graph input placeholder functionality ------*/

const graphInputArea = document.getElementById('graph-input');
const graphWeightRadios = document.querySelectorAll('input[name="graph-weight"]');

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
graphWeightRadios.forEach(radio => radio.addEventListener('change', updateGraphPlaceholder));


/*------- graph input placeholder functionality ------*/





/*------- graph input parsing into JSON functionality ------*/

const form = document.getElementById("graph-input-form");
const graphInputJSON = {};

form.addEventListener('submit', convertIntoJSON);

function convertIntoJSON(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    formData.forEach((value, key) => {
        graphInputJSON[key] = value;
    })

    console.log(graphInputJSON);
}



/*------- graph input parsing into JSON functionality ------*/





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