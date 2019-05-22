var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),    // html代码压缩
    uglify = require('gulp-uglify'),      //js压缩
    concat = require('gulp-concat'),      //js合并
    browserify = require('browserify'),
    stream = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');         //解决模块化



/*
var paths = {
    lib:['js/index.js','js/main.js']
} //定义要操作的文件路径
*/

// 第三方库的引用
gulp.task('CommonJs', function() {
    return gulp.src('./vendor/*.js')
        .pipe(concat('common.js'))    //合并所有js到common.js
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./dev'));  //输出
});



gulp.task('MainJs', function () {
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
