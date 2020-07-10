
document.addEventListener('DOMContentLoaded', function()
{
 	var title = document.title;
 	// 识别标题
 	sendMessageToBackground(title, 1);
});


// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	request = JSON.parse(request);
	if(request.infer_res == 1){  //推断结果
		toastr.options = {
		  "closeButton": true,
		  "debug": false,
		  "newestOnTop": false,
		  "progressBar": false,
		  "positionClass": "toast-top-full-width",
		  "preventDuplicates": false,
		  "onclick": null,
		  "showDuration": "300",
		  "hideDuration": "1000",
		  "timeOut": "5000",
		  "extendedTimeOut": "1000",
		  "showEasing": "swing",
		  "hideEasing": "linear",
		  "showMethod": "fadeIn",
		  "hideMethod": "fadeOut"
		};
		if(request.is_title){
			if(request.is_fake){
				toastr.warning('友情提示：该页面可能包含谣言哦～请勿轻信');
			}
		}
		else{
			if(request.is_fake){
				toastr.warning(request.content,'友情提示：这则消息很可能是谣言～请勿轻信');
			}
			else{
				toastr.info(request.content,'非谣言，请放心食用～');
			}
		}
	}
});

// 主动发送消息给后台
function sendMessageToBackground(message, isTitle) {
	var msg = {is_title: isTitle, content: message};
	chrome.runtime.sendMessage(JSON.stringify(msg));
}


let selectState = 'off'
let last_select_content = ''  //记录上次推断的内容，防止重复推断

//用chrome的storage接口，查看之前有没有存储 'switch' 
chrome.storage.sync.get(['switch'], function (result) {
    //如果有设置
    if (result.switch) {
        //把值(on / off)赋值给网页上翻译插件的状态变量
        selectState = result.switch
    }
});


//监听鼠标释放事件
window.onmouseup = function (e) {
    //如果用户选择的是关闭选项 就不识别划词是否是谣言
    if (selectState === 'off') return;

    //获取到用户选中的内容
    let select_content = window.getSelection().toString().trim()

    //如果什么内容都没有选择或选择的是上次推断的内容（防止过于灵敏），就不执行下面的，直接返回（
    if (!select_content || select_content == last_select_content) {
        return;
    } else {
    	//发送给background识别
    	sendMessageToBackground(JSON.stringify(select_content), 0);
    	last_select_content = select_content;
    }
}

