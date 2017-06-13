jQuery(document).ready($ => {
  let count = 0;
  let rowSpan = 1;
  $("#sampleForm").submit(ev => {
    ev.preventDefault();
    const input = document.getElementsByClassName("sampleInput");
    let sampleData = "";

    for (let i = 0; i < input.length; i++) {
      if (i === 1 || (i % 4 === 0 && i > 0)) {
        if (i % 4 === 0 && i > 0) {
          sampleData += "<span></span>";
        }
        if (i === input.length - 3) {
          sampleData += `
            <td>
              <a href="#" class="newParameter" data-toggle="modal" data-target="#parameterModal">
                <i class="fa fa-plus icon-position" aria-hidden="true"></i>
              </a>
              <a href="#" class="deleteParameter">
                <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
              </a>
              ${input[i].value}
            </td>`;
        } else {
          sampleData += `
            <td>
              <a href="#">
                <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
              </a>
              ${input[i].value}
            </td>`;
        }
      } else {
        sampleData += `<td>${input[i].value}</td>`;
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
    let sampleInfo = $("#sampleInfo");
    const sampleNew = `<tr id="sampleInf">${sampleInfo.html()}</tr>`;
    $(sampleNew).insertAfter("#sampleInfo");
    $("#sampleInfo").attr("id", "sampleInfo2");

    sampleData = sampleData.replace(/<span><\/span>/g, "</tr><tr>");
    sampleData = `<tr id="sampleInfo3">${sampleData}</tr>`;

    $(sampleData).insertAfter("#sampleInfo2");
    $("#sampleInfo2").remove();
    $("#sampleInf").attr("id", "sampleInfo");

    let type = $("#sampleInfo3").children().first().text();
    type = `<a href="#" class="removeSample">
              <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
            </a>
            ${type}`;

    $("#sampleInfo3").children().first().html(type);
    $("#sampleInfo3").children().first().attr("rowspan", rowSpan);
    $("#sampleInfo3").removeAttr("id");
    $(".modal").css("display", "none");
    document.getElementById("sampleForm").reset();
    count = 0;
    rowSpan = 1;

    $(".removeSample").click(function(ev) {
      ev.preventDefault();
      const rowSpan = $(this).parent().attr("rowspan");
      let row = $(this).parent().parent();
      for (let i = 0; i < rowSpan; i++) {
        let next = $(row).next();
        $(row).remove();
        row = next;
      }

      let total = 0;
      const $numberSamples = $(".numberSamples");
      for (let i = 0; i < $numberSamples.length; i++) {
        total += Number($($numberSamples[i]).parent().next().text());
      }
      $("#totalPrice").text(total);
    });

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
