var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),    // html代码压缩
    uglify = require('gulp-uglify'),      //js压缩
    concat = require('gulp-concat'),      //js合并
    browserify = require('browserify'),
    stream = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),      //解决模块化
    //connect = require('gulp-connect'),    //  文件改变 自动刷新浏览器

    browserSync = require('browser-sync'),    //自动打开浏览器

    watch = require('gulp-watch'),      //监听
    runSequence = require('run-sequence'),  //任务顺序执行

    spritesmith = require('gulp.spritesmith');  // 雪碧图


/*
var paths = {
    lib:['js/index.js','js/main.js']
} //定义要操作的文件路径
*/

// 第三方库的引用
gulp.task('devCommonJs', function () {
    return gulp.src('./vendor/*.js')
        .pipe(concat('common.js'))    //合并所有js到common.js
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./dev'))  //输出
        .pipe(browserSync.reload({stream: true}))
})

//  合并css
gulp.task('devCss', function () {
    return gulp.src('./css/*.css')
        .pipe(concat('app.css')) //合并css
        .pipe(gulp.dest('./dev'))
        .pipe(browserSync.reload({stream: true}))
})


// 生成应用js
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
        .pipe(gulp.dest('./dev'))
        .pipe(browserSync.reload({stream: true}));

})




// 生成雪碧图
gulp.task('sprite', function () {
    var spriteData = gulp.src('./icon/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png', // 生成的雪碧图的名称
            cssName: '../css/sprite.css', // 生成css文件
            imgPath: '../img/sprite.png', // 手动指定路径, 会直接出现在background属性的值中
            padding: 5, // 小图之间的间距, 防止重叠
            // css模板
            cssTemplate: (data) => {
                // data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
                let arr = [],
                    width = data.spritesheet.px.width,
                    height = data.spritesheet.px.height,
                    url = data.spritesheet.image
                arr.push(
                    `.icon {
                          display: inline-block;
                          vertical-align: middle;
                          background: url("${url}") no-repeat;
                        }
                    `);

                data.sprites.forEach(function (sprite) {
                    arr.push(
                        `.i-${sprite.name} {
                              width: ${sprite.px.width};
                              height: ${sprite.px.height};
                              background-position: ${sprite.px.offset_x} ${sprite.px.offset_y};
                              background-size: ${sprite.px.width} ${sprite.px.height};
                            }
                        `);
                });

                return arr.join('');
            }

        }));

    return spriteData.pipe(gulp.dest('./img'))

})
// 实现浏览器的热更新
gulp.task('browser', function () {
    browserSync.init({
        server: {
            files: ['**'],
            proxy: 'localhost', // 设置本地服务器的地址
            index: 'index.html' // 指定默认打开的文件
        },
        port: 8000  // 指定访问服务器的端口号
    })
    gulp.watch('./*.html').on('change', browserSync.reload)
    gulp.watch('./vendor/*.js', gulp.series('devCommonJs'))
    gulp.watch('./module/*.js', gulp.series('devMainJs'))
    gulp.watch('./icon/*.png', gulp.series('sprite'))

    gulp.watch('./css/*.css', gulp.series('devCss'))


})


//  监听任务 浏览器自动刷新


/*gulp.task('watch', function() {
    w('./vendor/*.js', 'devCommonJs')
    w('./module/*.js', 'devMainJs')

    function w(path, task) {
        watch(path, function() {
            gulp.start(task);
            browserSync.reload();
        })
    }
})*/

/*gulp.task('watch', function() {
    //gulp.watch('./vendor/!*.js', ['devCommonJs'])

    //gulp.watch('./js/!*.js', ['devMainJs'])
})*/
gulp.task('dev', gulp.series('devCss', 'devCommonJs', 'devMainJs', 'browser'))


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
