const edit = document.querySelector('.edit');
const activate = document.querySelector('.activate');
const forms = document.querySelectorAll('.adminForm');

for (let i = 0; i < forms.length; i++) {
  const elements = forms[i].elements;
  for (let j = 0; j < elements.length; j++) {
    if (!elements[j].id.includes('edit') && !elements[j].id.includes('activate')) {
      elements[j].disabled = true;
    }
  }
}

edit.addEventListener('click', function(ev) {
  ev.preventDefault();
  const id = this.id.slice(5);
  const form = document.getElementById(`form-${id}`);
  const elements = form.elements;
  for (let j = 0; j < elements.length; j++) {
    if (!elements[j].id.includes('edit') && !elements[j].id.includes('activate')) {
      elements[j].disabled = !elements[j].disabled;
    }
  }
});

activate.addEventListener('click', function(ev) {
  ev.preventDefault();
  let txt;
  const id = this.id.slice(9);
  const form = document.getElementById(`deactivateForm-${id}`);
  const status = document.getElementById(`status-${id}`);

  if (this.innerText === 'Activar Cuenta') {
    txt = '¿Estás seguro que deseas reactivar esta cuenta?';
    status.value = '2';
  } else {
    txt = '¿Estás seguro que deseas desactivar esta cuenta?';
    status.value = '3';
  }

  if (confirm(txt))
    form.submit();
});
