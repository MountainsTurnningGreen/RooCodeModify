import { MongoClient } from "mongodb"

async function testMongoDBConnection() {
	const uri = "mongodb://127.0.0.1:27017"
	const client = new MongoClient(uri)

	try {
		// 连接到MongoDB服务器
		await client.connect()
		console.log("成功连接到MongoDB服务器!")

		// 选择数据库和集合
		const db = client.db("roo_code_feedback")
		const collection = db.collection("feedbacks")

		// 插入测试数据
		const testData = {
			feedback: "positive",
			timestamp: Date.now(),
			messageTs: Date.now(),
			conversationRound: [],
			taskId: "test-task-id",
			user: "test-user-id",
			extensionVersion: "1.0.0",
			timestampISO: new Date().toISOString(),
			test: true,
		}

		const result = await collection.insertOne(testData)
		console.log("测试数据已插入，插入ID:", result.insertedId)

		// 查询数据
		const documents = await collection.find({ test: true }).toArray()
		console.log("从数据库中查询到的文档数量:", documents.length)

		// 删除测试数据
		await collection.deleteMany({ test: true })
		console.log("测试数据已清理")

		console.log("MongoDB连接和基本操作测试成功!")
	} catch (error) {
		console.error("MongoDB连接或操作失败:", error)
	} finally {
		await client.close()
		console.log("MongoDB连接已关闭")
	}
}

testMongoDBConnection()
