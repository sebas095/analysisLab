// Form
const form = document.getElementById('profile');
const inputs = form.elements;

// Buttons
const btnEdit = document.getElementById('edit');

// Disable inputs
for (let i = 0; i < inputs.length; i++) {
  inputs[i].disabled = true;
}

btnEdit.disabled = false;
btnEdit.addEventListener('click', (ev) => {
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].disabled = !inputs[i].disabled;
  }
  btnEdit.disabled = false;
});
