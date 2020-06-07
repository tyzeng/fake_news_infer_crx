import tensorflow as tf
import fake_news_classifier as run_classifier
from bert_master import tokenization,modeling
import numpy as np

MAX_SEQ_LENGTH = 128
vocab_file = "./bert_model_zh_cn/vocab.txt"
do_lower_case = True
use_tpu = False
label_list = [0, 1]
label_dict = {0:"true", 1: "fake"}
num_train_steps = None
num_warmup_steps = None
learning_rate = 2e-5
init_checkpoint = "./weibo_and_t_train_20/model.ckpt-98002"
bert_config_file = "./bert_model_zh_cn/bert_config.json"
bert_config = modeling.BertConfig.from_json_file(bert_config_file)
tpu_cluster_resolver = None
master = None
iterations_per_loop = 1000
num_tpu_cores = 8
save_checkpoints_steps = 1000
output_dir = './weibo_and_t_train_20/'
params = {"batch_size":8}

def load_model():
    is_per_host = tf.contrib.tpu.InputPipelineConfig.PER_HOST_V2
    run_config = tf.contrib.tpu.RunConfig(
    cluster=tpu_cluster_resolver,
    master=master,
    model_dir=output_dir,
    save_checkpoints_steps=save_checkpoints_steps,
    tpu_config=tf.contrib.tpu.TPUConfig(
                iterations_per_loop=iterations_per_loop,
                num_shards=num_tpu_cores,
                per_host_input_for_training=is_per_host))


    tokenizer = tokenization.FullTokenizer(
                vocab_file=vocab_file, do_lower_case=do_lower_case)

    model_fn = run_classifier.model_fn_builder(
                bert_config=bert_config,
                num_labels=len(label_list),
                init_checkpoint=init_checkpoint,
                learning_rate=learning_rate,
                num_train_steps=num_train_steps,
                num_warmup_steps=num_warmup_steps,
                use_tpu=use_tpu,
                use_one_hot_embeddings=use_tpu)

        # estimator = tf.estimator.Estimator(model_fn=model_fn,
        #                                    params=params,
        #                                    model_dir="./weibo_and_t_train_20/")
    estimator = tf.contrib.tpu.TPUEstimator(
                use_tpu=use_tpu,
                model_fn=model_fn,
                config=run_config,
                train_batch_size=8,
                eval_batch_size=8,
                predict_batch_size=8)
    return estimator,tokenizer

def getPrediction(estimator,tokenizer,in_sentences):
    input_examples = [run_classifier.InputExample(guid="", text_a = x, text_b = None, label = 0) 
                      for x in in_sentences] # here, "" is just a dummy label
    input_features = run_classifier.convert_examples_to_features(input_examples, label_list, MAX_SEQ_LENGTH, tokenizer)
    predict_input_fn = run_classifier.input_fn_builder(features=input_features, 
                                                       seq_length=MAX_SEQ_LENGTH,
                                                       is_training=False, drop_remainder=False)

    predictions = estimator.predict(predict_input_fn)

#     print(predictions[0])
    return [(sentence, prediction['probabilities']) for sentence, prediction in zip(in_sentences, predictions)]
    # export_dir = './weibo_and_t_train_20/model.pb/'
    # predict_fn = tf.contrib.predictor.from_saved_model(export_dir)
    # predictions = predict_fn(input_features)#({'inputs': input_features})
    # print(predictions)

# def raw_serving_input_fn():
#     serialized_tf_example = tf.placeholder(tf.float32, shape=[None, FLAGS.train_image_size,FLAGS.train_image_size,3], name="images")
#     features = {"images": serialized_tf_example}
#     receiver_tensors = {'predictor_inputs': serialized_tf_example}
#     return tf.estimator.export.ServingInputReceiver(features, receiver_tensors)

if __name__ == "__main__":

    pred_sentences = ["新型冠状病毒怕热，用过的口罩放到开水里煮可以多次使用",
                        "有消息称：“金银花、绿茶能防控新型冠状病毒感染。”",
                        "即使是没有症状的患者，也可以传播新型冠状病毒。"]

    estimator,tokenizer = load_model()

    # export_dir_base = os.path.join(output_dir,"model-pb")

    # estimator.export_savedmodel(export_dir_base, serving_input_receiver_fn,
    #                         strip_default_attrs=True)

    predictions = getPrediction(estimator,tokenizer,pred_sentences)

    for sen,probs in predictions:
        pred = np.argmax(np.array(probs), axis=0)
        print(sen,label_dict[pred])