jQuery(document).ready(function($){
  var form = document.getElementById("sampleForm");
  $('#sampleForm').submit(function(ev){
    ev.preventDefault();
    var input = document.getElementsByClassName('sampleInput');
    var sampleData ="";
    for (var i = 0; i < input.length; i++) {
      if(i == 1){
        sampleData +=`<td>
                        <a href="#" data-toggle="modal" data-target="#parameterModal">
                          <i class="fa fa-plus icon-position" aria-hidden="true"></i>
                        </a>
                        <a href="#">
                          <i class="fa fa-minus-circle icon-red icon-position" aria-hidden="true"></i>
                        </a> ${input[i].value} 
                      </td>`;
      }
      else{
        sampleData +="<td>" + input[i].value + "</td>";
      }
    }
    $('.modal').modal('hide');
    var sampleInfo = document.getElementById('sampleInfo');
    var sampleNew = "<tr>" + sampleInfo.innerHTML + "</tr>";
    sampleInfo.innerHTML =sampleData;
    $(sampleNew).insertAfter("#sampleInfo");
    $('.modal').css("display", "none");
    return false;
  });
});
