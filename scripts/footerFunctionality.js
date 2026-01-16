
const footerForm = document.querySelector('.footer-form-container');

export function openFooterForm() {
    footerForm.style.display = 'flex';
}

export function closeFooterForm() {
    footerForm.style.display = 'none';
}