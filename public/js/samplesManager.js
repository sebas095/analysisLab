jQuery(document).ready(($) => {
  $('.sampleForm').submit((ev) => {
    ev.preventDefault();
    // console.log('FORM');
    const input = document.getElementsByClassName('sampleInput');
    let sampleData = '';

    for (let i = 0; i < input.length; i++) {
      sampleData += `<td>${input[i].value}</td>`;
    }

    $('.modal').modal('hide');
    let sampleInfo = document.getElementById('sampleInfo');
    const sampleNew = `<tr id="sampleInf">${sampleInfo.innerHTML}</tr>`;
    sampleInfo.innerHTML = sampleData;

    $(sampleNew).insertAfter('#sampleInfo');
    $('#sampleInfo').removeAttr('id');
    $('#sampleInf').attr('id', 'sampleInfo');
    $('.modal').css('display', 'none');
    // $('#sampleForm').attr('id', 'sampleForm2');

    return false;
  });
});
