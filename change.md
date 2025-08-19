问题一、反馈按钮增加，加后端调试增加：

chatRow.tsx 修改满意按钮状态
ExtensionMesage.ts 支持新的消息类型
webviewMessageHandler.ts 在后端处理这个消息

问题二、增加todo工具
路由选择功能1.在类型定义中添加工具名称。 packages/types/src/tool.ts 2.创建工具实现。在 src/core/tools 目录下创建你的工具实现文件，例如 yourNewTool.ts 3.在 src/core/prompts/tools 目录下创建工具描述文件，例如 your-new-tool.ts。4.注册工具描述函数。src/core/prompts/tools/index.ts中导入工具描述函数，在toolDescriptionMap中添加工具5.在工具处理器中导入和注册工具。修改 src/core/assistant-message/presentAssistantMessage.ts 文件：导入工具后并在工具逻辑处理逻辑中添加工具6.最后将工具添加到适当的工具组。

问题三、增加系统提示词，要求其必须使用mcp中的私有库

一：一个与大模型后端交互的场景，最好用dify完成
二：一个按钮能够收集大模型的回复信息，将回复的信息发送到代码库中，并生成相应的代码（利用qdrant存储大模型回复信息）
三：一个todo工具，这个工具可以使得模型推送并行代码到代码库中
四：
