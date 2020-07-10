# fake_news_infer_crx
## 运行说明
1. 服务器端运行fake_news_infer/run_server.py（需要在run_server.py中填写该服务器IP）
2. 用户本地浏览器加载Rumour Recognize Extensions插件（需要在background.js中修改为1中的服务器IP）
## 代码说明
### fake_news_infer
包含Tensorflow框架建立的谣言识别算法模型，服务器端接受前端请求调用模型推断。
### Rumour Recognize Extensions
谣言识别插件，调用RPC服务实现与服务器的交互，前端消息提醒设计。
