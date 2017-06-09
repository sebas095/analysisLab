jQuery(document).ready($ => {
  let count = 0;
  let rowSpan = 1;
  $("#sampleForm").submit(ev => {
    ev.preventDefault();
    const input = document.getElementsByClassName("sampleInput");
    let sampleData = "";

    for (let i = 0; i < input.length; i++) {
      if (i === 1) {
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
        sampleData += `<td>${input[i].value}</td>\n`;
      }
      if (i % 3 === 0 && i > 0) {
        sampleData += `
          <td>
            <input type="number" style="text-align:center" min="0" value="0" class="numberSamples" name="numberSamples">
          </td>
          <td>${input[i].value}</td>`;
      }
    }

    $(".modal").modal("hide");
    let sampleInfo = document.getElementById("sampleInfo");
    const sampleNew = `<tr id="sampleInf">${sampleInfo.innerHTML}</tr>`;
    sampleInfo.innerHTML = sampleData;

    $(sampleNew).insertAfter("#sampleInfo");
    $("#sampleInfo").removeAttr("id");
    $("#sampleInf").attr("id", "sampleInfo");
    let type = $("#sampleInfo").prev().children().first().text();
    type = `<a href="#">
              <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
            </a>
            ${type}`;
    $("#sampleInfo").prev().children().first().html(type);
    $("#sampleInfo").prev().children().first().attr("rowspan", rowSpan);
    $(".modal").css("display", "none");
    document.getElementById("sampleForm").reset();
    count = 0;
    rowSpan = 1;

    $(".numberSamples").on("keyup mouseup", function() {
      if (this.value) {
        const price = Number($(this).parent().prev().text());
        $(this).parent().next().text(this.value * price);
        let total = 0;
        const $numberSamples = $(".numberSamples");
        for (let i = 0; i < $numberSamples.length; i++) {
          total += Number($($numberSamples[i]).parent().next().text());
        }
        $("#totalPrice").text(total);
      } else {
        $(this).parent().next().text("0");
      }
    });

    return false;
  });

  $(".addParameter").click(ev => {
    // <div class="col-sm-2">
    //   <a href="#" class="addParameter" id="add0"><i class="fa fa-plus fa-2x fix-position" aria-hidden="true"></i></a>
    //   <a href="#" class="removeParameter" id="remove0"><i class="fa fa-minus-circle fa-2x fix-position icon-red" aria-hidden="true"></i></a>
    // </div>
    ev.preventDefault();
    count++, rowSpan++;
    $("#parameters").append(
      `<div class="row" id="parameter${count}">
        <div class="col-sm-12">
          <div class="col-sm-3">
            <div class="form-group">
              <input type="text" class="form-control sampleInput" required="" id="parameter${count}">
            </div>
          </div>
          <div class="col-sm-4">
            <div class="form-group">
              <input type="text" class="form-control sampleInput" required="" id="method${count}">
            </div>
          </div>
          <div class="col-sm-3">
            <div class="form-group">
              <input type="text" class="form-control sampleInput" required="" id="price${count}">
            </div>
          </div>
          <div class="col-sm-2">
            <a href="#" class="addParameter" id="add${count}"><i class="fa fa-plus fa-2x fix-position" aria-hidden="true"></i></a>
            <a href="#" class="removeParameter" id="remove${count}"><i class="fa fa-minus-circle fa-2x fix-position icon-red" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>
    `
    );
  });

  $(".removeParameter").click(function(ev) {
    ev.preventDefault();
    const id = $(this).attr("id").split("remove")[1];
    $(`#parameter${id}`).remove();
  });
});
