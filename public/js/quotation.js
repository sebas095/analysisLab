const accept = document.querySelectorAll(".accept");
const reject = document.querySelectorAll(".reject");

for (let i = 0; i < accept.length; i++) {
  accept[i].addEventListener("click", function(ev) {
    ev.preventDefault();
    const id = this.id.slice(7);
    document.querySelector(`#veredict-${id}`).value = "accept";
    document.querySelector(`#form-${id}`).submit();
  });

  reject[i].addEventListener("click", function(ev) {
    ev.preventDefault();
    const id = this.id.slice(7);
    if (!document.querySelector(`#text-${id}`).value) {
      document.querySelector("#modalAlert").innerHTML = `
        <div class="col-sm-12">
          <div class="alert alert-danger alert-dismissable">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            <p class="center">Este campo es obligatorio para rechazar la cotización</p>
          </div>
        </div>`;
    } else {
      document.querySelector(`#veredict-${id}`).value = "reject";
      document.querySelector(`#form-${id}`).submit();
    }
  });
}
