const accept = document.querySelector('.accept');
const reject = document.querySelector('.reject');

accept.addEventListener('click', function(ev) {
  ev.preventDefault();
  const id = this.id.slice(7);
  document.querySelector(`#account-${id}`).value = 'accept';
  document.querySelector(`#form-${id}`).submit();
});

reject.addEventListener('click', function(ev) {
  ev.preventDefault();
  const id = this.id.slice(7);
  document.querySelector(`#account-${id}`).value = 'reject';
  document.querySelector(`#form-${id}`).submit();
});
