# coding:utf-8
from werkzeug.wrappers import Request, Response
from werkzeug.serving import run_simple

from jsonrpc import JSONRPCResponseManager, dispatcher
from tf_inference import load_model, getPrediction, infer

IP = '166.111.80.171'  # 填写服务器的IP地址，crx的后端(background.js)需要进行相应修改
PORT = 4378

manager = JSONRPCResponseManager()
estimator,tokenizer = load_model()

def infer_sentence(sentence="123"):
    print(sentence)
    return infer([sentence], estimator, tokenizer)

dispatcher.add_method(infer_sentence, name='infer')

@Request.application
def application(request):
    response = manager.handle(request.get_data(cache=False, as_text=True), dispatcher)
    res = Response(response.json, mimetype='application/x-www-form-urlencoded')
    res.headers['Access-Control-Allow-Origin'] = '*'
    
    return res


if __name__ == '__main__':
    run_simple(IP, PORT, application)