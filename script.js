
const graphInputArea = document.getElementById('graph-input-area');
const graphWeightRadios = document.querySelectorAll('input[name="graph-weight"]');

function updateGraphPlaceholder() {
    const selectedWeight = document.getElementById('weighted').checked;
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
document.addEventListener('DOMContentLoaded', updateGraphPlaceholder);

// Update placeholder on radio change
graphWeightRadios.forEach(radio => radio.addEventListener('change', updateGraphPlaceholder));


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