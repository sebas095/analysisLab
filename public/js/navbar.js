$(document).ready(() => {
  const sideslider = $("[data-toggle=collapse-side]");
  const sel = sideslider.attr("data-target");
  const sel2 = sideslider.attr("data-target-2");

  sideslider.click(ev => {
    $(sel).toggleClass("in");
    $(sel2).toggleClass("out");
  });

  $("#logout").click(ev => {
    ev.preventDefault();
    $("#exit").submit();
  });
});
