jQuery(document).ready(($) => {
  $('#sampleForm').submit((ev) => {
    ev.preventDefault();
    const input = document.getElementsByClassName('sampleInput');
    let sampleData = '';

    for (let i = 0; i < input.length; i++) {
      if(i === 1) {
        sampleData += `
          <td>
            <a href="#" data-toggle="modal" data-target="#parameterModal">
              <i class="fa fa-plus icon-position" aria-hidden="true"></i>
            </a>
            <a href="#">
              <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
            </a>
            ${input[i].value}
          </td>`;
      } else {
        sampleData += `<td>${input[i].value}</td>`;
      }
      if (i % 3 === 0 && i > 0) {
        sampleData += `
          <td>
            <input type="number" style="text-align:center" min="1" name="numberSamples">
          </td>
          <td></td>`;
      }
    }

    $('.modal').modal('hide');
    let sampleInfo = document.getElementById('sampleInfo');
    const sampleNew = `<tr id="sampleInf">${sampleInfo.innerHTML}</tr>`;
    sampleInfo.innerHTML = sampleData;

    $(sampleNew).insertAfter('#sampleInfo');
    $('#sampleInfo').removeAttr('id');
    $('#sampleInf').attr('id', 'sampleInfo');
    $('.modal').css('display', 'none');
    document.getElementById('sampleForm').reset();

    return false;
  });
});
