import { type NextRequest } from "next/server"
import { get_posts } from "@/lib/posts"

/**
 * GET /api/posts
 * 获取文章列表
 *
 * Query参数:
 * - page: 页码（默认1）
 * - limit: 每页数量（默认10）
 * - year: 年份筛选
 * - tag: 标签筛选（单个）
 * - tags: 标签筛选（多个，逗号分隔）
 * - sort: 排序方式（asc/desc，默认desc）
 */
export async function GET(request: NextRequest) {
  const search_params = request.nextUrl.searchParams

  // 解析查询参数
  const page = parseInt(search_params.get("page") || "1", 10)
  const limit = parseInt(search_params.get("limit") || "10", 10)
  const year = search_params.get("year") || undefined
  const tag = search_params.get("tag") || undefined
  const tags_param = search_params.get("tags")
  const tags = tags_param ? tags_param.split(",").filter(Boolean) : undefined
  const sort_param = search_params.get("sort")
  const sort: "asc" | "desc" = sort_param === "asc" ? "asc" : "desc"

  // 参数验证
  if (page < 1) {
    return Response.json({ error: "page必须大于0" }, { status: 400 })
  }

  if (limit < 1 || limit > 100) {
    return Response.json({ error: "limit必须在1-100之间" }, { status: 400 })
  }

  // 获取文章列表
  const result = get_posts({
    page,
    limit,
    year,
    tag,
    tags,
    sort,
  })

  return Response.json(result)
}