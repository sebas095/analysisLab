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
    document.querySelector(`#veredict-${id}`).value = "reject";
    document.querySelector(`#form-${id}`).submit();
  });
}
