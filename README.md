# myVite
# vite 基本原理

vite 启动的时候会有很多请求  
vite 会通过type=module的方式去加载资源，即使用esm规范去加载  
将代码以esm方式进行组织和编写  
用到的模块就通过import的方式加载下来  

由于浏览器只能加载基于本地服务器的相对的地址，所以加载vue这种做不到  
因此对于这种包要进行预打包，挂载到node_modules下去读