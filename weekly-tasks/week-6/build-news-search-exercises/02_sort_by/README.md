# 第 2 阶段：增加日期和字母排序

在第一阶段基础上加入 Sort by：Date（新到旧）和 Alphabet（标题升序）。

新闻语言固定为英文，不提供语言选框；不包含内容长度排序。

## 运行

在本文件夹中打开终端，执行：

```sh
python3 -m pip install -r requirements.txt
python3 app.py
```

打开 http://127.0.0.1:5000 ，点击 Search 获取新闻。所有阶段使用相同端口，运行下一阶段前先停止上一阶段。

密钥读取方式沿用原项目：优先使用 NEWS_API_KEY 环境变量，否则使用本文件夹 config.py 中的 newsApiKey。

结构保持为：网页 → static/script.js → Flask app.py → NewsAPI → Flask → 网页。无 Slack 服务集成。

Results 使用原项目的 20、50、100；它控制向 API 请求的数量，实际展示数量可能较少。每次只获取一页，不代表 API 中的全部新闻。
