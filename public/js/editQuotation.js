jQuery(document).ready($ => {
  $("#sendSample").css("display", "none");
  $(".fa-plus, .fa-search, .fa-minus-circle").css("display", "none");

  $("#edit").click(ev => {
    const inputs = $(".edit");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].disabled = !inputs[i].disabled;
    }

    if (inputs[0].disabled) {
      $("#sendSample").css("display", "none");
      $(".fa-plus, .fa-search, .fa-minus-circle").css("display", "none");
    } else {
      $("#sendSample").css("display", "inline-block");
      $(".fa-plus, .fa-search, .fa-minus-circle").css(
        "display",
        "inline-block"
      );
    }
  });
});

let btnDeactivate = null;
if (document.getElementById("deactivate"))
  btnDeactivate = document.getElementById("deactivate");

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
