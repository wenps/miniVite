// 基于koa创建一个node服务器，处理各种资源请求
// 基本资源类型：index.html, js, vue

const koa = require('koa')
const path = require('path')
const fs = require('fs')
const compilerSFC = require('@vue/compiler-sfc') // 获取SFC编译器
const compilerDOM = require('@vue/compiler-dom') // 获取SFC编译器

// 基于koa创建服务器实例
const app = new koa()

// 路由处理
app.use(async ctx => {
    const {url, query} = ctx.request
    // 首页请求
    if(url === '/') {
        ctx.type = 'text/html'
        // 加载index.html
        ctx.body = fs.readFileSync(path.join(__dirname, './index.html'), 'utf-8')
    } 
    // js文件的获取
    else if(url.endsWith('js')) {
        const p = path.join(__dirname, url)
        ctx.type = 'application/javascript'
        // 加载js
        // 将文件中的裸模块都做替换
        ctx.body = rewriteImport(fs.readFileSync(p, 'utf-8'))
    }
    // 如果当前url是以 /@modules/ 开头的，说明这个是我们刚刚替换的裸模块部分，要对这部分内容去node_modules里面找
    else if(url.startsWith('/@modules/')) {
        // 找到裸模块之后，就去读取node_modules下的package.json , 在module选项中可以找到当前打包的esm文件打包位置

        // （1）获取当前裸模块名称
        const moduleName = url.replace('/@modules/', '')
        // (2) 基于裸模块名称去node_modules获取目标文件夹路径
        const prefix = path.join(__dirname, './node_modules', moduleName).replaceAll('\\','/')
        // (3) 基于路径读取文件夹下的package.json 下的module字段，获得裸模块的esm文件路径
        const module = require(prefix + '/package.json').module;
        const filePath = path.join(prefix, module)
        // (4) 基于裸模块的esm文件路径，获得裸模块对应的esm文件
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(fs.readFileSync(filePath, 'utf-8')) // 这里同样需要对文件进行裸模块地址重写，防止内部调用了裸模块
    }
    // vue后缀处理，如果链接中有.vue 就认为这个是SFC请求
    else if(url.indexOf('.vue') != -1) {

       const p = path.join(__dirname, url.split('?')[0]) // 由于import { render as __render } from '${url}?type=template' 链接上可能带参数，所以要解析出来
       const ret = compilerSFC.parse(fs.readFileSync(p ,'utf-8')) // 解析获得的SFC文件，这里会获得一个AST
    //    console.log(ret);

       if (!query.type) { // 如果请求中没有type，这个是SFC请求
            //  交由@vue/compiler-sfc进行编译

            // 获取AST中脚本部分的内容
            const scriptContent = ret.descriptor.script.content

            // 替换默认导出为一个常量，方便后续修改
            //  我们这里实际上会获得一个script内容，就是vue模板script部分，正常会export 出一个对象
            //  这里用一个常量去代替导出的对象
            const script = scriptContent.replace('export default ', 'const __script = ') 
            console.log(script);

            ctx.type = 'application/javascript'
            // 返回更改的文件内容
            ctx.body = `
                    ${rewriteImport(script)} // 处理script部分的裸地址
                    // 解析template 基于@vue/compiler-dom，这里不会直接去解析template，而是说会重新构建一个esm即import，发请求的方式去让服务器解析这部分内容
                    import { render as __render } from '${url}?type=template' //  这个链接上的参数说明要去继续模板
                    __script.render = __render // 提供脚本对象一个render函数去渲染页面
                    export default __script
            `
       } 
       // 解析template获得render函数
       else if(query.type == 'template') {
            const templateContent = ret.descriptor.template.content // 获取AST中模板部分的内容
            const render = compilerDOM.compile(templateContent, {mode: 'module'}).code // 将模板解析为可以渲染的render函数
            ctx.type = 'application/javascript'
            ctx.body = rewriteImport(render) // 将render函数返回，注意这里要处理内容部分的裸地址
       }
    }
})

// 裸模块地址重写
// import xx form vue
// import xx form '/@modules/vue'
// 将这类模块改成相对地址

function rewriteImport(content) {
    // 匹配到content中所有 from xx 中的内容，即xx部分
    return content.replace(/ from ['"](.*)['"]/g, function(s1, s2) {
        // 判断当前导入是否相对地址
        if(s2.startsWith('/') || s2.startsWith('./') || s2.startsWith('../')) {
            return s1
        }
        // 这个是裸模块，需要去替换为相对地址 
        else {
            return ` from '/@modules/${s2}'`
        }
    })
}

app.listen(3000, ()=>{
    console.log('服务器已启动');
})