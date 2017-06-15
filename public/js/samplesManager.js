let count = 0, count2 = 0;
let rowSpan = 1, rowSpan2 = 1;
jQuery(document).ready($ => {
  $("#sampleForm").submit(ev => {
    ev.preventDefault();
    const input = document.getElementsByClassName("sampleInput");
    let sampleData = "";

    for (let i = 0; i < input.length; i++) {
      if ((i - 1) % 3 === 0 && i > 0) {
        if (i > 1) {
          sampleData += "<span></span>";
        }
        if (i === input.length - 3) {
          sampleData += `
            <td>
              <a href="#" id="otherParameter" class="newParameter" data-toggle="modal" data-target="#parameterModal">
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
              <a href="#" class="deleteParameter">
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
          <td>0</td>`;
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

    if ($(".sampleInput").length > 4) {
      const sampleInput = $(".sampleInput");
      for (let i = 4; i < sampleInput.length; i += 3) {
        $(sampleInput[i]).parent().parent().parent().parent().remove();
      }
    }

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

    $(".deleteParameter").click(function(ev) {
      ev.preventDefault();
      const row = $(this).parent().parent();
      const data = getTagAndRowSpan(row);
      if ($(this).prev().attr("class") === "newParameter") {
        if (data.rowSpan > 1) {
          const length = row.prev().children().length;
          const prev = $(row.prev().children()[length - 5]);
          prev.prepend(
            `<a href="#" id="otherParameter" class="newParameter" data-toggle="modal" data-target="#parameterModal">
              <i class="fa fa-plus icon-position" aria-hidden="true"></i>
            </a>`
          );
          row.remove();
          data.tag.children().first().attr("rowspan", data.rowSpan - 1);
        } else {
          data.tag.remove();
        }
      } else {
        if ($(this).parent().prev().attr("rowspan")) {
          const td = $(this).parent().prev();
          td.attr("rowspan", data.rowSpan - 1);
          row.next().prepend(td);
          row.remove();
        } else {
          row.remove();
          data.tag.children().first().attr("rowspan", data.rowSpan - 1);
        }
      }
      let total = 0;
      const $numberSamples = $(".numberSamples");
      for (let i = 0; i < $numberSamples.length; i++) {
        total += Number($($numberSamples[i]).parent().next().text());
      }
      $("#totalPrice").text(total);
    });

    updateInputs();
    return false;
  });

  $("#parameterForm").submit(ev => {
    ev.preventDefault();
    const input = document.getElementsByClassName("parameterInput");
    let sampleData = "";
    const parent = $("#otherParameter").parent().parent();
    const row = getTagAndRowSpan(parent);
    $("#otherParameter").remove();

    for (let i = 0; i < input.length; i++) {
      if (i % 3 === 0) {
        sampleData += "<span></span>";
        if (i === input.length - 3) {
          sampleData += `
            <td>
              <a href="#" id="otherParameter" class="newParameter" data-toggle="modal" data-target="#parameterModal">
                <i class="fa fa-plus icon-position" aria-hidden="true"></i>
              </a>
              <a href="#" class="deleteOtherParameter">
                <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
              </a>
              ${input[i].value}
            </td>`;
        } else {
          sampleData += `
            <td>
              <a href="#" class="deleteOtherParameter">
                <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
              </a>
              ${input[i].value}
            </td>`;
        }
      } else {
        sampleData += `<td>${input[i].value}</td>`;
      }

      if ((i + 1) % 3 === 0 && i > 0) {
        sampleData += `
          <td>
            <input type="number" style="text-align:center" min="0" value="0" class="numberSamples" name="numberSamples">
          </td>
          <td>0</td>`;
      }
    }

    sampleData = sampleData.replace(/<span><\/span>/g, "</tr><tr>");
    $(sampleData).insertAfter(parent);
    row.tag.children().first().attr("rowspan", row.rowSpan + rowSpan2);
    $(".modal").modal("hide");
    $(".modal").css("display", "none");
    document.getElementById("parameterForm").reset();

    count2 = 0;
    rowSpan2 = 1;

    if ($(".parameterInput").length > 3) {
      const sampleInput = $(".parameterInput");
      for (let i = 3; i < sampleInput.length; i += 3) {
        $(sampleInput[i]).parent().parent().parent().parent().remove();
      }
    }

    $(".deleteOtherParameter").click(function(ev) {
      ev.preventDefault();
      const row = $(this).parent().parent();
      const data = getTagAndRowSpan(row);
      if ($(this).prev().attr("class") === "newParameter") {
        if (data.rowSpan > 1) {
          const length = row.prev().children().length;
          const prev = $(row.prev().children()[length - 5]);
          prev.prepend(
            `<a href="#" id="otherParameter" class="newParameter" data-toggle="modal" data-target="#parameterModal">
              <i class="fa fa-plus icon-position" aria-hidden="true"></i>
            </a>`
          );
          row.remove();
          data.tag.children().first().attr("rowspan", data.rowSpan - 1);
        } else {
          data.tag.remove();
        }
      } else {
        if ($(this).parent().prev().attr("rowspan")) {
          const td = $(this).parent().prev();
          td.attr("rowspan", data.rowSpan - 1);
          row.next().prepend(td);
          row.remove();
        } else {
          row.remove();
          data.tag.children().first().attr("rowspan", data.rowSpan - 1);
        }
      }

      let total = 0;
      const $numberSamples = $(".numberSamples");
      for (let i = 0; i < $numberSamples.length; i++) {
        total += Number($($numberSamples[i]).parent().next().text());
      }
      $("#totalPrice").text(total);
    });

    updateInputs();
    return false;
  });

  $("#sampleSearchForm").submit(function(ev) {
    ev.preventDefault();
    let countIds = 0;
    const searchInput = $(".sampleSearchInput");
    let sampleName = "AGUA CRUDA";
    let sampleData = "";
    if (searchInput.length === 1) {
      // TODO ajax for search samples
    } else {
      const select = $(".select").filter((index, input) => {
        return $(input).is(":checked");
      });

      for (let i = 0; i < select.length; i++) {
        const id = "." + $(select[i]).attr("id");
        const parameter = $(id)[0].value;
        const method = $(id)[1].value;
        const price = $(id)[2].value;
        if (i == 0) {
          sampleData += `
            <td>
              <a href="#" class="removeSearch">
                <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
              </a>
              ${sampleName}
            </td>`;
        } else {
          sampleData += "<span></span>";
        }
        if (i === select.length - 1) {
          sampleData += `
              <td>
                <a href="#" id="otherParameter" class="newParameter" data-toggle="modal" data-target="#parameterModal">
                  <i class="fa fa-plus icon-position" aria-hidden="true"></i>
                </a>
                <a href="#" class="deleteSearchParameter">
                  <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
                </a>
                ${parameter}
              </td>
              <td>${method}</td>
              <td>${price}</td>`;
        } else {
          sampleData += `
              <td>
                <a href="#" class="deleteSearchParameter">
                  <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
                </a>
                ${parameter}
              </td>
              <td>${method}</td>
              <td>${price}</td>`;
        }

        sampleData += `
            <td>
              <input type="number" style="text-align:center" min="0" value="0" class="numberSamples" name="numberSamples">
            </td>
            <td>0</td>`;
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

      $("#sampleInfo3").children().first().attr("rowspan", select.length);
      $("#sampleInfo3").removeAttr("id");
      $(".modal").css("display", "none");
      document.getElementById("sampleSearchForm").reset();
      count = 0;

      if ($(".sampleSearchInput").length > 1) {
        $(".deleteSearch").remove();
      }

      $(".removeSearch").click(function(ev) {
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

      $(".deleteSearchParameter").click(function(ev) {
        ev.preventDefault();
        const row = $(this).parent().parent();
        const data = getTagAndRowSpan(row);
        if ($(this).prev().attr("class") === "newParameter") {
          if (data.rowSpan > 1) {
            const length = row.prev().children().length;
            const prev = $(row.prev().children()[length - 5]);
            prev.prepend(
              `<a href="#" id="otherParameter" class="newParameter" data-toggle="modal" data-target="#parameterModal">
                <i class="fa fa-plus icon-position" aria-hidden="true"></i>
              </a>`
            );
            row.remove();
            data.tag.children().first().attr("rowspan", data.rowSpan - 1);
          } else {
            data.tag.remove();
          }
        } else {
          if ($(this).parent().prev().attr("rowspan")) {
            const td = $(this).parent().prev();
            td.attr("rowspan", data.rowSpan - 1);
            row.next().prepend(td);
            row.remove();
          } else {
            row.remove();
            data.tag.children().first().attr("rowspan", data.rowSpan - 1);
          }
        }
        let total = 0;
        const $numberSamples = $(".numberSamples");
        for (let i = 0; i < $numberSamples.length; i++) {
          total += Number($($numberSamples[i]).parent().next().text());
        }
        $("#totalPrice").text(total);
      });

      updateInputs();
      return false;
    }
  });

  $("#sendSample").click(ev => {
    ev.preventDefault();
    // TODO poner valores en los input hidden
  });
});

function getTagAndRowSpan(row) {
  let curr = $(row);
  while (true) {
    if (curr.children().first().attr("rowspan")) {
      return {
        rowSpan: Number(curr.children().first().attr("rowspan")),
        tag: curr
      };
    } else {
      curr = curr.prev();
    }
  }
}

function updateInputs() {
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
      setTimeout(
        () => {
          if (!this.value) {
            $(this).val(0);
            $(this).parent().next().text("0");
            let total = 0;
            const $numberSamples = $(".numberSamples");
            for (let i = 0; i < $numberSamples.length; i++) {
              total += Number($($numberSamples[i]).parent().next().text());
            }
            $("#totalPrice").text(total);
          }
        },
        1000
      );
    }
  });
}

function addParameter(id, opt) {
  let input = "", div = "";
  let add = "", remove = "";
  let curr = 0;
  $(id).remove();
  if (opt === 1) {
    input = "sampleInput";
    div = "#parameters";
    rowSpan++, count++;
    curr = count;
    add = "add";
    remove = "remove";
  } else {
    input = "parameterInput";
    div = "#othersParameters";
    rowSpan2++, count2++;
    curr = count2;
    add = "adds";
    remove = "removes";
  }
  $(div).append(
    `<div class="row">
      <div class="col-sm-12">
        <div class="col-sm-3">
          <div class="form-group">
            <input type="text" class="form-control ${input}" required="">
          </div>
        </div>
        <div class="col-sm-4">
          <div class="form-group">
            <input type="text" class="form-control ${input}" required="">
          </div>
        </div>
        <div class="col-sm-3">
          <div class="form-group">
            <input type="number" min="0" class="form-control ${input}" required="">
          </div>
        </div>
        <div class="col-sm-2 icons-parameters">
          <span class="addParameter" onclick="addParameter('#${add}${curr}', ${opt})" id="${add}${curr}"><i class="fa fa-plus fa-2x fix-position" aria-hidden="true"></i></span>
          <span class="removeParameter" onclick="removeParameter('#${remove}${curr}', ${opt})" id="${remove}${curr}"><i class="fa fa-minus-circle fa-2x fix-position icon-red" aria-hidden="true"></i></span>
        </div>
      </div>
    </div>`
  );
}

function removeParameter(id, opt) {
  if (opt === 1) {
    if ($(".sampleInput").length > 4) {
      rowSpan--;
      const parent = $(id).parent().parent().parent();
      const next = parent.next();
      const center = parent.children().children().children().children().first();

      if (center.attr("class") === "center") {
        parent.remove();
        const div = next.children().children().last();
        div.removeClass("icons-parameters");
        const sampleInput = $(".sampleInput");
        const labels = ["Parámetro", "Método", "Precio"];
        for (let i = 1; i < 4; i++) {
          $(
            `<div class="center">
            <label>${labels[i - 1]}</label>
          </div>`
          ).insertBefore($(sampleInput[i]));
        }
      } else {
        if ($(id).prev().attr("class") === "addParameter") {
          const prev = parent.prev().children().children().last();
          prev.prepend(
            `<span class="addParameter" onclick="addParameter('#add${count}', ${opt})" id="add${count}">
          <i class="fa fa-plus fa-2x fix-position" aria-hidden="true"></i>
        </span>`
          );
          parent.remove();
        } else {
          parent.remove();
        }
      }
    }
  } else if (opt === 2) {
    if ($(".parameterInput").length > 3) {
      rowSpan2--;
      const parent = $(id).parent().parent().parent();
      const next = parent.next();
      const center = parent.children().children().children().children().first();

      if (center.attr("class") === "center") {
        parent.remove();
        const div = next.children().children().last();
        div.removeClass("icons-parameters");
        const parameterInput = $(".parameterInput");
        const labels = ["Parámetro", "Método", "Precio"];
        for (let i = 0; i < 3; i++) {
          $(
            `<div class="center">
              <label>${labels[i]}</label>
            </div>`
          ).insertBefore($(parameterInput[i]));
        }
      } else {
        if ($(id).prev().attr("class") === "addParameter") {
          const prev = parent.prev().children().children().last();
          prev.prepend(
            `<span class="addParameter" onclick="addParameter('#adds${count2}', ${opt})" id="adds${count2}">
              <i class="fa fa-plus fa-2x fix-position" aria-hidden="true"></i>
            </span>`
          );
          parent.remove();
        } else {
          parent.remove();
        }
      }
    }
  }
}
