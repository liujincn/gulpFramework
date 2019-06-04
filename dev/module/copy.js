module.exports = function () {
        var clipboard = new ClipboardJS('.copy-btn')
        clipboard.on('success', function (e) {
            $('.copy-tips').fadeIn().fadeOut(800)
        })
        clipboard.on('error', function (e) {
            console.log(e)
        })

}
