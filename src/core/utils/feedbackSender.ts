import * as https from "https"
import * as http from "http"
import * as url from "url"
import { ClineMessage } from "@roo-code/types"

export interface FeedbackData {
	feedback: "positive" | "negative"
	timestamp: number
	messageTs: number
	conversationRound: ClineMessage[]
	taskId: string
	user?: string
	extensionVersion?: string
	timestampISO?: string
}

/**
 * 发送反馈数据到远程服务器
 * @param feedbackData 反馈数据
 * @param serverUrl 远程服务器URL
 * @returns Promise<boolean> 发送是否成功
 */
export async function sendFeedbackToRemoteServer(feedbackData: FeedbackData, serverUrl?: string): Promise<boolean> {
	// 如果没有配置服务器URL，则不发送
	if (!serverUrl) {
		console.log("未配置远程服务器URL，跳过发送反馈")
		return true
	}

	// 如果是MongoDB连接字符串，则直接连接MongoDB
	if (serverUrl.startsWith("mongodb://") || serverUrl.startsWith("mongodb+srv://")) {
		return sendFeedbackToMongoDB(feedbackData, serverUrl)
	}

	try {
		const postData = JSON.stringify(feedbackData)
		const urlObj = new URL(serverUrl)

		const options = {
			hostname: urlObj.hostname,
			port: urlObj.port,
			path: urlObj.pathname,
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(postData),
			},
		}

		return new Promise((resolve, reject) => {
			const req = (urlObj.protocol === "https:" ? https : http).request(options, (res) => {
				let data = ""

				res.on("data", (chunk) => {
					data += chunk
				})

				res.on("end", () => {
					if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
						console.log("反馈数据发送成功:", data)
						resolve(true)
					} else {
						console.error(`发送反馈数据失败，状态码: ${res.statusCode}`, data)
						resolve(false)
					}
				})
			})

			req.on("error", (error) => {
				console.error("发送反馈数据时网络错误:", error)
				resolve(false)
			})

			req.write(postData)
			req.end()
		})
	} catch (error) {
		console.error("发送反馈数据时发生错误:", error)
		return false
	}
}

/**
 * 发送反馈数据到MongoDB数据库
 * @param feedbackData 反馈数据
 * @param mongoUri MongoDB连接字符串
 * @returns Promise<boolean> 发送是否成功
 */
async function sendFeedbackToMongoDB(feedbackData: FeedbackData, mongoUri: string): Promise<boolean> {
	try {
		// 动态导入MongoDB客户端以避免在不需要时加载
		const { MongoClient } = await import("mongodb")

		// 创建MongoDB客户端
		const client = new MongoClient(mongoUri)

		try {
			// 连接到MongoDB
			await client.connect()
			console.log("成功连接到MongoDB")

			// 选择数据库和集合
			const db = client.db("roo_code_feedback")
			const collection = db.collection("feedbacks")

			// 插入反馈数据
			const result = await collection.insertOne(feedbackData)
			console.log("反馈数据已成功录入MongoDB，插入ID:", result.insertedId)

			return true
		} finally {
			// 关闭连接
			await client.close()
		}
	} catch (error) {
		console.error("发送反馈数据到MongoDB时发生错误:", error)
		return false
	}
}
