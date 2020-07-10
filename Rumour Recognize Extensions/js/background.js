function infer(request, callback){
	// 调用服务器上模型推断过程
	var text = request.content;
	var xmlhttp;
	if (window.XMLHttpRequest){
		xmlhttp=new XMLHttpRequest();
	}else{
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function(){
  		if (xmlhttp.readyState==4 && xmlhttp.status==200){
    		var res = xmlhttp.responseText;
    		var text_res = JSON.parse(res).result;
    		if(text_res == 'fake'){
    			callback({infer_res: 1, is_title: request.is_title, is_fake: 1, content:request.content});
    		}
    		else{
    			callback({infer_res: 1, is_title: request.is_title, is_fake: 0, content:request.content});
    		}
    	}
    }
    // 需要填写服务器地址和端口，对应fake_news_infer/run_server.py中的地址和端口
	xmlhttp.open("POST","http://166.111.80.171:4378/jsonrpc",true);  
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	var send_content = {"method": "infer","params": {"sentence": text}, "jsonrpc": "2.0","id": 0};
	var jsonstr =JSON.stringify(send_content);
	xmlhttp.send(jsonstr);
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.sendMessage(tabId, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}

//用于发送推断结果给content
function sendInferResultToContentScript(message)
{
	sendMessageToContentScript(JSON.stringify(message));
}

function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse)
{
	request = JSON.parse(req);
	if(request.content){
		// 发送给服务器识别是否谣言
		infer(request, sendInferResultToContentScript);
	}
});