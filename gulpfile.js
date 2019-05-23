var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),    // html代码压缩
    uglify = require('gulp-uglify'),      //js压缩
    concat = require('gulp-concat'),      //js合并
    browserify = require('browserify'),
    stream = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),      //解决模块化
    connect = require('gulp-connect'),    //  文件改变 自动刷新浏览器

    browserSync=require('browser-sync'),    //自动打开浏览器

    watch = require('gulp-watch'),      //监听
    runSequence = require('run-sequence');    //任务顺序执行







/*
var paths = {
    lib:['js/index.js','js/main.js']
} //定义要操作的文件路径
*/

// 第三方库的引用
gulp.task('devCommonJs', function() {
    return gulp.src('./vendor/*.js')
        .pipe(concat('common.js'))    //合并所有js到common.js
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./dev'));  //输出
})


gulp.task('devMainJs', function () {
    // 定义入口文件
    return browserify({
        entries: 'js/app.js',
        debug: true
    })
    // 转成node readabel stream流，拥有pipe方法（stream流分小片段传输）
        .bundle()
        .on('error', function (error) {
            console.log(error.toString())
        })
        // 转成gulp系的stream流，node系只有content，添加名字
        .pipe(stream('main.js'))
        // 转成二进制的流（二进制方式整体传输）
        .pipe(buffer())
        // 输出
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./dev'));
})


// 设置任务---架设静态服务器
gulp.task('browser', function () {
    browserSync.init({
        server:{
            files:['**'],
            proxy:'localhost', // 设置本地服务器的地址
            index:'index.html' // 指定默认打开的文件
        },
        port:8000  // 指定访问服务器的端口号
    })
    gulp.watch('./*.html').on('change', browserSync.reload)
})
//  监听任务 浏览器自动刷新


/*gulp.task('watch', function() {
    w('./vendor/!*.js', 'DevCommonJs')
    w('./module/!*.js', 'DevMainJs')

    function w(path, task) {
        watch(path, function() {
            //runSequence(task) // dev模式下 自定刷新页面
            gulp.series(task)
            browserSync.reload();

        })
    }
})*/

/*gulp.task('watch', function() {
    gulp.watch('./vendor/!*.js',gulp.series('devCommonJs'))
    gulp.watch('./module/!*.js',gulp.series('devMainJs'))
})*/

gulp.task('dev', gulp.series('devCommonJs', 'devMainJs','browser','watch'));


/*

gulp.task('MainJs', function() {
    return gulp.src('./vendor/!*.js')
        .pipe(concat('common.js'))    //合并所有js到common.js
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./dev'));  //输出
});

*/



// 压缩页面html
/*
gulp.task('htmlMiniTask', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        //collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        //removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('./!*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/'));
});
*/
