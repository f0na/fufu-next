import { type NextRequest } from "next/server"
import { get_links } from "@/lib/links"
import type { LinksResponse } from "@/lib/types/link"

/**
 * GET /api/links
 * 获取链接列表
 *
 * Query参数:
 * - page: 页码（默认1）
 * - limit: 每页数量（默认12）
 * - tags: 标签筛选（逗号分隔）
 * - starred: 是否只显示星标（true/false）
 * - sort: 排序方式（asc/desc，默认desc）
 */
export async function GET(request: NextRequest): Promise<Response> {
  const search_params = request.nextUrl.searchParams

  // 解析查询参数
  const page = parseInt(search_params.get("page") || "1", 10)
  const limit = parseInt(search_params.get("limit") || "12", 10)
  const tags_param = search_params.get("tags")
  const tags = tags_param ? tags_param.split(",").filter(Boolean) : undefined
  const starred_param = search_params.get("starred")
  const starred = starred_param === "true" ? true : starred_param === "false" ? false : undefined
  const sort_param = search_params.get("sort")
  const sort: "asc" | "desc" = sort_param === "asc" ? "asc" : "desc"

  // 参数验证
  if (page < 1) {
    return Response.json({ error: "page必须大于0" }, { status: 400 })
  }

  if (limit < 1 || limit > 100) {
    return Response.json({ error: "limit必须在1-100之间" }, { status: 400 })
  }

  // 获取链接列表
  const result: LinksResponse = await get_links({
    page,
    limit,
    tags,
    starred,
    sort,
  })

  return Response.json(result)
}