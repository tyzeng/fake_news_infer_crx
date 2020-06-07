$(function(){
	var btn = document.getElementById("infer");
	btn.onclick = function(){
		var text =$("#news_text").val();
		// 获取结果
		var res = infer(text);

		if(res == 0){
			res_html = "<font size='3'>不能断定为谣言</font>";
		}
		else{
			res_html = "<font size='3' color='red'>识别为谣言！</font>";
		}
		document.getElementById("result").innerHTML=res_html;
	}
});

function infer(text)
{
	var res = "";
	// 调用模型推断过程


	// return 0;
	return 1;
}