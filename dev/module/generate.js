module.exports = function () {


    //生成图片方法
    this.cutting=function(){
        var copyDom = $(".cutting");
        var width = copyDom.offsetWidth;//dom宽
        var height = copyDom.offsetHeight;//dom高
        var scale =2;//放大倍数

        html2canvas(copyDom[0],{useCORS:true,logging:true},{
            dpi: window.devicePixelRatio*2,
            scale:scale,
            width:width,
            heigth:height,
        }).then(function (canvas) {
            $(".cutting_img").attr('src', canvas.toDataURL());
        })
        popup('.generate-dialog')


    }

}
