import { type NextRequest } from "next/server"
import { get_friends } from "@/lib/friends"
import type { FriendsResponse } from "@/lib/types/friend"

export async function GET(request: NextRequest): Promise<Response> {
  const search_params = request.nextUrl.searchParams

  const page = parseInt(search_params.get("page") || "1", 10)
  const limit = parseInt(search_params.get("limit") || "12", 10)
  const sort_param = search_params.get("sort")
  const sort: "asc" | "desc" = sort_param === "asc" ? "asc" : "desc"

  if (page < 1) {
    return Response.json({ error: "page必须大于0" }, { status: 400 })
  }

  if (limit < 1 || limit > 100) {
    return Response.json({ error: "limit必须在1-100之间" }, { status: 400 })
  }

  const result: FriendsResponse = await get_friends({
    page,
    limit,
    sort,
  })

  return Response.json(result)
}