jQuery(document).ready(function($){
  var form = document.getElementById("sampleForm");
  $('#sampleForm').submit(function(ev){
    ev.preventDefault();
    var input = document.getElementsByClassName('sampleInput');
    var sampleData ="";
    for (var i = 0; i < input.length; i++) {
      sampleData +="<td>" + input[i].value + "</td>";
      console.log(input[i].value);
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
