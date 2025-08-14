export async function getGitHubStars() {
	// 检查是否在构建环境中，如果是则返回默认值
	if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
		console.log("Build environment detected, returning default GitHub stars value")
		return "1.2k"
	}

	try {
		const res = await fetch("https://api.github.com/repos/RooCodeInc/Roo-Code")
		const data = await res.json()

		if (typeof data.stargazers_count !== "number") {
			console.error("GitHub API: Invalid stargazers count. Possible that you got rate-limited?")
			return "1.2k"
		}

		return formatNumber(data.stargazers_count)
	} catch (error) {
		console.error("Error fetching GitHub stars:", error)
		return "1.2k"
	}
}

export async function getVSCodeReviews() {
	// 检查是否在构建环境中，如果是则返回默认值
	if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
		console.log("Build environment detected, returning default VSCode reviews")
		return []
	}

	const res = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json;api-version=7.1-preview.1",
		},
		body: JSON.stringify({
			filters: [
				{
					criteria: [
						{
							filterType: 7,
							value: "RooVeterinaryInc.roo-cline",
						},
					],
				},
			],
			flags: 914,
		}),
	})

	try {
		const data = await res.json()
		const reviews = data?.results?.[0]?.extensions?.[0]?.reviews

		if (!reviews) {
			console.error("VSCode API: Missing reviews in response")
			return []
		}

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		return reviews.map((review: any) => ({
			name: review.reviewer?.displayName || "Anonymous",
			rating: review.rating,
			content: review.text,
			date: new Date(review.date).toLocaleDateString(),
		}))
	} catch (error) {
		console.error("Error fetching VSCode reviews:", error)
		return []
	}
}

export async function getVSCodeDownloads() {
	// 检查是否在构建环境中，如果是则返回默认值
	if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
		console.log("Build environment detected, returning default VSCode downloads value")
		return "5.0k"
	}

	const res = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json;api-version=7.1-preview.1",
		},
		body: JSON.stringify({
			filters: [
				{
					criteria: [
						{
							filterType: 7,
							value: "RooVeterinaryInc.roo-cline",
						},
					],
				},
			],
			flags: 914,
		}),
	})
	try {
		const data = await res.json()
		const statistics = data?.results?.[0]?.extensions?.[0]?.statistics

		if (!statistics) {
			console.error("VSCode API: Missing statistics in response")
			return "5.0k"
		}

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		const installStat = statistics.find((stat: any) => stat.statisticName === "install")
		if (!installStat) {
			console.error("VSCode API: Install count not found")
			return "5.0k"
		}

		return formatNumber(installStat.value)
	} catch (error) {
		console.error("Error fetching VSCode downloads:", error)
		return "5.0k"
	}
}

function formatNumber(num: number): string {
	// divide by 1000 to convert to "thousands" format,
	// multiply by 10, floor the result, then divide by 10 to keep one decimal place.
	const truncated = Math.floor((num / 1000) * 10) / 10
	// ensure one decimal is always shown and append "k"
	return truncated.toFixed(1) + "k"

	// examples:
	// console.log(formatNumber(337231)) -> "337.2k"
	// console.log(formatNumber(23233)) -> "23.2k"
	// console.log(formatNumber(2322)) -> "2.3k"
	// console.log(formatNumber(212)) -> "0.2k"
}
