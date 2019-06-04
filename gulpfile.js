var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    htmlmin = require('gulp-htmlmin'),    // html代码压缩
    uglify = require('gulp-uglify'),      //js压缩
    concat = require('gulp-concat'),      //js合并
    browserify = require('browserify'),
    stream = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),      //解决模块化
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,             //浏览器的热更新
    del = require('del'),      //删除
    spritesmith = require('gulp.spritesmith'), // 雪碧图
    cdnizer = require('gulp-cdnizer'),  //cdn

    tinypng_nokey = require('gulp-tinypng-nokey'),    //压缩图片

    isCdn = false


// 第三方库的引用
gulp.task('devVendorJs', function () {
    return gulp.src('./dev/vendor/*.js')
        .pipe(concat('vendor.js'))    //合并所有js到common.js
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./js'))  //输出
        .pipe(reload({stream: true}))
})

gulp.task('buildVendorJs', function () {
    return gulp.src('./dev/vendor/*.js')
        .pipe(concat('vendor.js'))    //合并所有js到common.js
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./dist/js'))  //输出
})

//  css
gulp.task('devCss', function () {
    return gulp.src('./dev/css/*.css')
        .pipe(concat('app.css')) //合并css
        .pipe(gulp.dest('./css'))
        .pipe(reload({stream: true}))
})
gulp.task('buildCss', function () {
    return gulp.src('./dev/css/*.css')
        .pipe(plugins.autoprefixer({
            browsers: ['>1%', 'last 2 versions'],
            cascade: true,
            remove: true
        }))
        .pipe(concat('app.css')) //合并css

        .pipe(plugins.if(isCdn === true, cdnizer({
                defaultCDNBase: 'http://gulp.lj.dev.q1.com/dist/',
                relativeRoot: 'css',
                files: ['**/*.{gif,png,jpg}']
            })
        ))
        .pipe(plugins.cleanCss())/*压缩css*/
        .pipe(plugins.rev())
        .pipe(gulp.dest('./dist/css'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('./dist/css'))
})
// 删除dist
gulp.task('del', function () {
    return del(['dist/**'])
})

// 应用js
gulp.task('devAppJs', function () {
    // 定义入口文件
    return browserify({
        entries: 'dev/js/main.js',
        debug: true
    })
    // 转成node readabel stream流，拥有pipe方法（stream流分小片段传输）
        .bundle()
        .on('error', function (error) {
            console.log(error.toString())
        })
        // 转成gulp系的stream流，node系只有content，添加名字
        .pipe(stream('app.js'))
        // 转成二进制的流（二进制方式整体传输）
        .pipe(buffer())
        // 输出
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./js'))
        .pipe(reload({stream: true}));

})
gulp.task('buildAppJs', function () {
    // 定义入口文件
    return browserify({
        entries: 'dev/js/main.js',
        debug: true
    })
    // 转成node readabel stream流，拥有pipe方法（stream流分小片段传输）
        .bundle()
        .on('error', function (error) {
            console.log(error.toString())
        })
        // 转成gulp系的stream流，node系只有content，添加名字
        .pipe(stream('app.js'))
        // 转成二进制的流（二进制方式整体传输）
        .pipe(buffer())
        // 输出
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('./dist/js'))

})

// 生成雪碧图
gulp.task('sprite', function () {
    var spriteData = gulp.src('./icon/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png', // 生成的雪碧图的名称
            cssName: '../dev/css/sprite.css', // 生成css文件
            imgPath: '../img/sprite.png', // 手动指定路径, 会直接出现在background属性的值中
            padding: 5, // 小图之间的间距, 防止重叠
            // css模板
            cssTemplate: (data) => {
                // data为对象，保存合成前小图和合成打大图的信息包括小图在大图之中的信息
                let arr = [],
                    width = data.spritesheet.px.width,
                    height = data.spritesheet.px.height,
                    url = data.spritesheet.image
                arr.push(`.icon {
    display: inline-block;
    vertical-align: middle;
    background: url("${url}") no-repeat;
    width: ${width};
    height: ${height};
}
`);
                data.sprites.forEach(function (sprite) {
                    arr.push(`.i-${sprite.name} {
    width: ${sprite.px.width};
    height: ${sprite.px.height};
    background-position: ${sprite.px.offset_x} ${sprite.px.offset_y};
    
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
    gulp.watch('./*.html').on('change', reload)
    gulp.watch('./dev/vendor/*.js', gulp.series('devVendorJs'))
    gulp.watch('./dev/module/*.js', gulp.series('devAppJs'))
    gulp.watch('./icon/*.png', gulp.series('sprite'))
    gulp.watch('./dev/css/*.css', gulp.series('devCss'))


})
//压缩图片
gulp.task('mini', function () {
    return gulp.src('./img/*.{png,jpg,gif}')
        //.pipe(tinypng_nokey())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/img'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/img'))
})

// 压缩页面html
gulp.task('html', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    }
    return gulp.src('./*.html')
        .pipe(htmlmin(options))
        .pipe(plugins.if(isCdn === true, cdnizer({
                defaultCDNBase: 'http://gulp.lj.dev.q1.com/dist/',
                files: ['**/*.{css,js,gif,png,jpg}']
            })
        ))
        .pipe(gulp.dest('dist/'))
})

gulp.task('revJs', function () {
    return gulp.src('./dist/js/*.js')
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/js'))
})


gulp.task('revHtml',function(){
    return gulp.src(['./dist/**/*.json','./dist/*.html'])
        .pipe(plugins.revCollector({replaceReved:true}))
        .pipe(gulp.dest('dist/')); //html更换css,js文件版本，更改完成之后保存的地址
})

gulp.task('revCss', function() {
    return gulp.src(['./dist/img/*.json', './dist/css/*.css']) //- 读取 rev-manifest.json 文件以及需要进行替换的图片
        .pipe(plugins.revCollector({replaceReved:true})) //- 执行文件内图片名的替换
        .pipe(gulp.dest('dist/css')); //- 替换后的文件输出的目录
});

gulp.task('dev', gulp.series('devCss', 'devVendorJs', 'devAppJs', 'sprite', 'browser'))
gulp.task('build', gulp.series('del', 'buildCss', 'buildVendorJs', 'buildAppJs', 'mini','revCss','revJs','html','revHtml'))
