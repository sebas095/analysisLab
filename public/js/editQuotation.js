// Form
const form = document.getElementById("quotation");
const inputs = form.elements;

// Buttons
const btnEdit = document.getElementById("edit");
let btnDeactivate = null;

if (document.getElementById("deactivate"))
  btnDeactivate = document.getElementById("deactivate");

// Disable inputs
for (let i = 0; i < inputs.length; i++) {
  if (
    !inputs[i].id.includes("edit") &&
    !inputs[i].id.includes("export") &&
    !inputs[i].id.includes("deactivate")
  )
    inputs[i].disabled = true;
}

btnEdit.addEventListener("click", ev => {
  ev.preventDefault();
  for (let i = 0; i < inputs.length; i++) {
    if (
      !inputs[i].id.includes("edit") &&
      !inputs[i].id.includes("export") &&
      !inputs[i].id.includes("deactivate")
    )
      inputs[i].disabled = !inputs[i].disabled;
  }
});

if (btnDeactivate) {
  btnDeactivate.addEventListener("click", function(ev) {
    ev.preventDefault();
    if (
      confirm(
        "¿Estas seguro que deseas solicitar la eliminación de la cotización?"
      )
    ) {
      document.getElementById("deactivateForm").submit();
    }
  });
}
