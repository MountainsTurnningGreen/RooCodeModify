import * as vscode from "vscode"
import * as fs from "fs/promises"
import * as path from "path"

import { Task } from "../task/Task"
import { ToolUse, PushToolResult, HandleError, RemoveClosingTag } from "../../shared/tools"
import { formatResponse } from "../prompts/responses"

// 检测并行代码类型
function detectParallelCode(code: string, language?: string): boolean {
	// MPI检测
	if (
		code.includes("#include <mpi.h>") ||
		code.includes("mpi4py") ||
		code.includes("use mpi") ||
		code.includes("import mpi")
	) {
		return true
	}

	// OpenMP检测
	if (code.includes("#pragma omp") || code.includes("omp parallel") || code.includes("!$omp")) {
		return true
	}

	// CUDA检测
	if (
		code.includes("__global__") ||
		code.includes("__device__") ||
		code.includes("cudaMalloc") ||
		code.includes("<<<") ||
		code.includes(">>>")
	) {
		return true
	}

	// Python多进程检测
	if (
		(language === "python" || !language) &&
		(code.includes("multiprocessing") ||
			code.includes("concurrent.futures") ||
			code.includes("threading") ||
			code.includes("asyncio"))
	) {
		return true
	}

	// pthread检测
	if (code.includes("pthread_create") || code.includes("#include <pthread.h>") || code.includes("std::thread")) {
		return true
	}

	return false
}

// 识别并行类型
function identifyParallelType(code: string): string {
	if (code.includes("#include <mpi.h>") || code.includes("mpi4py") || code.includes("use mpi")) {
		return "MPI"
	}
	if (code.includes("#pragma omp") || code.includes("omp parallel")) {
		return "OpenMP"
	}
	if (code.includes("__global__") || code.includes("cudaMalloc")) {
		return "CUDA"
	}
	if (code.includes("multiprocessing") || code.includes("concurrent.futures")) {
		return "Python Multiprocessing"
	}
	if (code.includes("pthread_create") || code.includes("#include <pthread.h>")) {
		return "Pthread"
	}
	if (code.includes("std::thread")) {
		return "C++ Thread"
	}
	if (code.includes("threading") || code.includes("asyncio")) {
		return "Python Threading"
	}
	return "Unknown Parallel Type"
}

export async function submitCodeChangesTool(
	cline: Task,
	block: ToolUse,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	// 遵循其他工具的标准模式：在partial为true时直接返回，不执行工具逻辑
	if (block.partial) {
		// 只是简单返回，等待完整参数传输完成
		return
	}

	// 只有当partial为false时才执行实际的工具逻辑
	try {
		const params = block.params

		// 检查必需参数
		if (!params || !params.path || params.path.trim().length === 0) {
			pushToolResult(
				formatResponse.toolError("No valid file path provided. Please provide a valid 'path' parameter."),
			)
			return
		}

		// 使用removeClosingTag清理所有参数，确保没有截断的标签
		const filePath = removeClosingTag("path", params.path.trim())
		const description = params.description ? removeClosingTag("description", params.description.trim()) : undefined
		const server_url = params.server_url ? removeClosingTag("server_url", params.server_url.trim()) : undefined
		const language = params.language ? removeClosingTag("language", params.language.trim()) : undefined

		// 检查占位符参数
		if (!filePath || filePath === "define" || filePath === "<" || filePath === "</") {
			console.log("[submitCodeChangesTool] Placeholder or incomplete path detected")
			pushToolResult(
				formatResponse.toolError(
					"Invalid path parameter. Please provide an actual file path, not placeholder values.",
				),
			)
			return
		}

		console.log("[submitCodeChangesTool] Reading file:", filePath)
		// 读取文件内容
		//await cline.say("text", `[submit_code_changes] Reading file: ${filePath}`)
		let code: string
		try {
			const absolutePath = path.resolve(filePath)
			code = await fs.readFile(absolutePath, "utf8")
		} catch (error) {
			console.log("[submitCodeChangesTool] Failed to read file:", error)
			pushToolResult(
				formatResponse.toolError(
					`Failed to read file '${filePath}': ${error instanceof Error ? error.message : String(error)}`,
				),
			)
			return
		}

		console.log("[submitCodeChangesTool] Detecting parallel code")
		// 检查是否为并行代码
		const isParallelCode = detectParallelCode(code, language)
		if (!isParallelCode) {
			console.log("[submitCodeChangesTool] Code is not parallel code")
			pushToolResult(
				formatResponse.toolError(
					"Code is not identified as parallel code (e.g., MPI, OpenMP, CUDA, etc.). This tool should only be used for actual parallel/distributed computing code.",
				),
			)
			return
		}

		// 获取服务器URL
		const remoteServerUrl =
			server_url && server_url !== "define"
				? server_url
				: process.env.ROO_CODE_PARALLEL_CODE_SERVER_URL || "http://localhost:3000/api/parallel-code"

		console.log("[submitCodeChangesTool] Preparing payload for server:", remoteServerUrl)
		// 准备提交数据
		const payload = {
			code,
			description: description && description !== "define" ? description : undefined,
			language: language && language !== "define" ? language : "unknown",
			isParallelCode,
			parallelType: identifyParallelType(code),
			timestamp: Date.now(),
			timestampISO: new Date().toISOString(),
			taskId: cline.taskId,
			extensionVersion:
				vscode.extensions.getExtension("RooVeterinaryInc.roo-cline")?.packageJSON?.version || "unknown",
		}

		// 提交到远程服务器
		await cline.say("text", `[submit_code_changes] Submitting parallel code to ${remoteServerUrl}...`)

		console.log("[submitCodeChangesTool] Sending request to server")
		const response = await fetch(remoteServerUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})

		console.log("[submitCodeChangesTool] Server response status:", response.status)
		if (!response.ok) {
			const errorText = await response.text()
			console.log("[submitCodeChangesTool] Server error response:", errorText)
			throw new Error(`Server responded with status ${response.status}: ${errorText}`)
		}

		const result = await response.json()
		console.log("[submitCodeChangesTool] Server response:", result)

		// 发送成功消息
		await cline.say(
			"text",
			`[submit_code_changes] Successfully submitted parallel code! Server response: ${JSON.stringify(result)}`,
		)
		pushToolResult(
			formatResponse.toolResult(
				`Successfully submitted parallel code to server. Response: ${JSON.stringify(result)}`,
			),
		)
	} catch (error) {
		console.log("[submitCodeChangesTool] Error:", error)
		await handleError("submitting code changes", error)
	}
}
