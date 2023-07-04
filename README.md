# myVite
# vite 基本原理

vite 启动的时候会有很多请求  
vite 会通过type=module的方式去加载资源，即使用esm规范去加载  
将代码以esm方式进行组织和编写  
用到的模块就通过import的方式加载下来  

由于浏览器只能加载基于本地服务器的相对的地址，所以加载vue这种做不到  
因此对于这种包要进行预打包，挂载到node_modules下去读

## 完整流程
启动一个服务器  
假设当前请求是 '/' 这种，默认是获取模板页，就会把目标html返回回去  

浏览器解析html 发现里面导入了vue的入口文件，比如main.js
那么就是去查找这个main.js  
假如入口文件处有一些裸模块，那么就会通过正则全部添加标识，比如/@modules/ 并将更新后的 main.js 返回

浏览器就会去解析main.js 假如发现esm语法就会继续请求  

假如发现请求的链接上有 /@modules/ 则说明是裸模块，就解析出资源名，去node_modules里面去找目标资源文件夹，因为文件夹下的package.json 的module 处指向了这个文件的esm打包文件的位置

所以获取当前裸模块esm打包文件的位置之后，去读取这个文件esm打包文件并同样对文件的裸模块加标识，然后把文件返回。  

解析完裸模块之后，如果遇到了.vue 文件，就要借助vue提供的@vue/compiler-sfc 和 @vue/compiler-dom 去协助解析

第一步读取vue文件

第二步通过@vue/compiler-sfc将vue文件转成ast树

第三步
  读取ast树的脚本部分，创建一个新脚本默认导出一个对象，这个对象指向的是ast树脚本部分的默认导出，并且在这个新脚本的上层重新构建一个esm导入路径和原来的vue文件相同，但加上参数是?template，告知服务器我这次需要获取vue文件模板的render函数，并将esm导入的值重命名为render，把这个render挂到新脚本的默认导出对象上，然后把新脚本返回。  
  浏览器继续新脚本，发现里面有一个esm的导入，就重新发起请求，服务器就会发现这个请求依旧是一个vue文件，但是加上?template说明这个要vue文件的render函数，所以就继续从ast树中读取template部分，调用 @vue/compiler-dom 把模板转成render函数返回。
  浏览器解决完esm导入之后得到模板的render，把render挂载到新脚本的默认导出对象上。  
  此时就可以得到一个对象 
```js
{
setup()
render()
...
}
```
这实际上就是组件类型的vnode  

当main.js 去执行
createApp(
    App
).mount('#app') 的时候就相当于 解析vue文件的虚拟节点


