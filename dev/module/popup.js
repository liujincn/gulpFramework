module.exports = function () {
    this.popup=function (tck) {

    $(".mask").height($(document).height()).fadeTo(250, 0.7)
    $(tck).css("left", ($(window).width() - $(tck).width()) / 2)
    $(tck).css("top", ($(window).height() - $(tck).height()) / 2)
    $(tck).show()
    $(".close").click(function() {
        $(".mask").add(tck).hide();
    })
    }
}
